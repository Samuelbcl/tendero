// ============================================================
//  PATHFINDING — navigation des clients.
//
//  MVP : la pièce est une boîte ouverte, le rayon est contre le mur du fond
//  et la caisse dans une zone dégagée → les trajets entrée↔rayon↔caisse↔sortie
//  ne traversent aucun obstacle. Un segment droit suffit.
//
//  C'est le SEAM (point d'extension) pour brancher `three-pathfinding`
//  (navmesh) en Phase 2/3 quand le layout se complexifie (allées, agrandissement).
//  L'API `findPath` ne changera pas : elle renverra juste plus de waypoints.
//  cf. ARCHITECTURE.md §4.
// ============================================================
import type { Vec3 } from '../types';

/**
 * Renvoie la liste de waypoints à suivre de `start` vers `end`.
 * MVP : ligne droite → un seul waypoint (la destination).
 */
export function findPath(_start: Vec3, end: Vec3): Vec3[] {
  return [end];
}
