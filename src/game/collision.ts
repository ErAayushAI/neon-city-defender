// Collision Manager with Spatial Optimization
import { ProjectileSystem } from './projectile';
import { PlayerDrone } from './player';
import { EnemyManager } from './enemy';
import { BossCoreX } from './boss';
import { BuildingManager } from './building';
import { PowerUpManager } from './powerup';
import { ParticleSystem } from './particle';
import { soundManager } from './audio';

export class CollisionManager {
  public checkAll(
    player: PlayerDrone,
    projectiles: ProjectileSystem,
    enemyManager: EnemyManager,
    boss: BossCoreX,
    buildingManager: BuildingManager,
    powerUpManager: PowerUpManager,
    particles: ParticleSystem,
    onEnemyKilled?: (scoreVal: number) => void
  ) {
    const projList = projectiles.getProjectiles();
    const enemies = enemyManager.getEnemies();
    const buildings = buildingManager.getBuildings();
    const powerUps = powerUpManager.getPowerUps();

    // 1. Player Projectiles vs Enemies & Boss
    for (let pIdx = projList.length - 1; pIdx >= 0; pIdx--) {
      const p = projList[pIdx];

      if (p.source === 'PLAYER') {
        let hit = false;

        // Check vs Enemies
        for (let eIdx = enemies.length - 1; eIdx >= 0; eIdx--) {
          const e = enemies[eIdx];
          const dist = Math.hypot(p.x - e.x, p.y - e.y);

          if (dist < p.radius + e.radius) {
            hit = true;
            const res = enemyManager.damageEnemy(eIdx, p.damage, particles);
            if (res.destroyed) {
              player.stats.enemiesDestroyed++;
              player.addScore(res.enemy.scoreValue, particles);

              // Chance to drop power-up (15%)
              if (Math.random() < 0.15) {
                powerUpManager.spawn(res.enemy.x, res.enemy.y);
              }

              if (onEnemyKilled) onEnemyKilled(res.enemy.scoreValue);
            }
            break;
          }
        }

        // Check vs Boss
        if (!hit && boss.active) {
          const distBoss = Math.hypot(p.x - boss.x, p.y - boss.y);
          if (distBoss < p.radius + boss.radius) {
            hit = true;
            const destroyed = boss.takeDamage(p.damage, particles);
            if (destroyed) {
              player.stats.bossesDefeated++;
              player.addScore(boss.scoreValue, particles);
              // Drop high-tier power-ups
              powerUpManager.spawn(boss.x - 20, boss.y, 'EMP_RECHARGE');
              powerUpManager.spawn(boss.x + 20, boss.y, 'SCORE_MULTIPLIER');
            }
          }
        }

        if (hit && !p.pierce) {
          projectiles.removeAt(pIdx);
          continue;
        }
      }

      // 2. Enemy & Boss Projectiles vs Player & Buildings
      else if (p.source === 'ENEMY' || p.source === 'BOSS') {
        // vs Player
        const distPlayer = Math.hypot(p.x - player.x, p.y - player.y);
        if (distPlayer < p.radius + player.radius) {
          player.takeDamage(p.damage, particles);
          projectiles.removeAt(pIdx);
          continue;
        }

        // vs Buildings
        let hitBuilding = false;
        for (const b of buildings) {
          if (b.destroyed) continue;
          if (
            p.x >= b.x - b.width / 2 &&
            p.x <= b.x + b.width / 2 &&
            p.y >= b.y - b.height / 2 &&
            p.y <= b.y + b.height / 2
          ) {
            buildingManager.damageBuilding(b.id, p.damage, particles);
            hitBuilding = true;
            break;
          }
        }

        if (hitBuilding) {
          projectiles.removeAt(pIdx);
          continue;
        }
      }
    }

    // 3. Player vs Power-ups Collection
    for (let puIdx = powerUps.length - 1; puIdx >= 0; puIdx--) {
      const pu = powerUps[puIdx];
      const dist = Math.hypot(player.x - pu.x, player.y - pu.y);

      if (dist < player.radius + pu.radius) {
        soundManager.playPowerUp();
        particles.emitExplosion(pu.x, pu.y, pu.glowColor, 15);

        switch (pu.type) {
          case 'HEALTH':
            player.stats.health = Math.min(player.stats.maxHealth, player.stats.health + 35);
            particles.addFloatingText(player.x, player.y - 30, '+35 HP REPAIRED', '#10b981');
            break;
          case 'ENERGY':
            player.stats.energy = Math.min(player.stats.maxEnergy, player.stats.energy + 50);
            particles.addFloatingText(player.x, player.y - 30, '+50 ENERGY', '#06b6d4');
            break;
          case 'RAPID_FIRE':
            player.stats.rapidFireActive = true;
            player.stats.rapidFireTimeRemaining = 8.0;
            particles.addFloatingText(player.x, player.y - 30, 'RAPID FIRE [8s]', '#f59e0b');
            break;
          case 'SHIELD':
            player.stats.shieldActive = true;
            player.stats.shieldTimeRemaining = 7.0;
            particles.addFloatingText(player.x, player.y - 30, 'CYBER SHIELD [7s]', '#3b82f6');
            break;
          case 'EMP_RECHARGE':
            player.stats.empCooldown = 0;
            particles.addFloatingText(player.x, player.y - 30, 'EMP READY!', '#d946ef');
            break;
          case 'SCORE_MULTIPLIER':
            player.stats.scoreMultiplierActive = true;
            player.stats.scoreMultiplierTimeRemaining = 10.0;
            particles.addFloatingText(player.x, player.y - 30, 'DOUBLE SCORE [10s]', '#eab308');
            break;
        }

        powerUpManager.remove(pu.id);
      }
    }

    // 4. Player Drone vs Enemy Drones (Ramming Damage)
    for (let eIdx = enemies.length - 1; eIdx >= 0; eIdx--) {
      const e = enemies[eIdx];
      const dist = Math.hypot(player.x - e.x, player.y - e.y);

      if (dist < player.radius + e.radius) {
        player.takeDamage(20, particles);
        enemyManager.damageEnemy(eIdx, 60, particles);
      }
    }
  }

  // Handle EMP shockwave wiping out enemies in range
  public handleEMP(
    empX: number,
    empY: number,
    radius: number,
    enemyManager: EnemyManager,
    projectiles: ProjectileSystem,
    boss: BossCoreX,
    particles: ParticleSystem,
    player: PlayerDrone
  ) {
    const enemies = enemyManager.getEnemies();
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const dist = Math.hypot(empX - e.x, empY - e.y);
      if (dist <= radius) {
        // High EMP Damage
        const res = enemyManager.damageEnemy(i, 180, particles);
        if (res.destroyed) {
          player.stats.enemiesDestroyed++;
          player.addScore(res.enemy.scoreValue, particles);
        }
      }
    }

    // Destroy all enemy projectiles caught in the blast
    const projList = projectiles.getProjectiles();
    for (let i = projList.length - 1; i >= 0; i--) {
      const p = projList[i];
      if (p.source === 'ENEMY' || p.source === 'BOSS') {
        const dist = Math.hypot(empX - p.x, empY - p.y);
        if (dist <= radius) {
          particles.emitSparks(p.x, p.y, '#38bdf8', 2);
          projectiles.removeAt(i);
        }
      }
    }

    // Heavy damage to Boss if in radius
    if (boss.active) {
      const distBoss = Math.hypot(empX - boss.x, empY - boss.y);
      if (distBoss <= radius + boss.radius) {
        const destroyed = boss.takeDamage(250, particles);
        if (destroyed) {
          player.stats.bossesDefeated++;
          player.addScore(boss.scoreValue, particles);
        }
      }
    }
  }
}
