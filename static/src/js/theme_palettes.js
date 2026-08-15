/** @odoo-module **/

// Paleta estándar IBM Carbon Design System para visualización de datos,
// reordenada para que los morados queden al final (no protagonistas).
// https://carbondesignsystem.com/data-visualization/color-palettes/
const CARBON_PALETTE = [
  "#1192e8",
  "#198038",
  "#fa4d56",
  "#b28600",
  "#009d9a",
  "#8a3800",
  "#9f1853",
  "#002d9c",
  "#ee538b",
  "#012749",
  "#570408",
  "#005d5d",
  "#a56eff",
  "#6929c4",
];

export const themePalettes = {
  animated: CARBON_PALETTE,
  frozen: ["#007bff", "#17a2b8", "#6f42c1", "#5bc0de", "#337ab7", "#4b9cd3", "#2a6496", "#1c3b70"],
  kelly: ["#28a745", "#ffac00", "#e06d53", "#71639e", "#17a2b8", "#6f42c1", "#d9534f", "#f0ad4e"],
  material: ["#2196f3", "#4caf50", "#ff9800", "#e91e63", "#9c27b0", "#00bcd4", "#ff5722", "#607d8b"],
  moonrise: ["#2c3e50", "#34495e", "#7f8c8d", "#95a5a6", "#bdc3c7", "#16a085", "#27ae60", "#2980b9"],
  spirited: ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#1abc9c", "#3498db", "#9b59b6", "#34495e"],
};

export const mapThemePalettes = {
  animated: ["#e0f3f8", "#1192e8", "#012749"],
  frozen: ["#e0f7fa", "#007bff", "#1c3b70"],
  kelly: ["#e8f5e9", "#28a745", "#1b5e20"],
  material: ["#e3f2fd", "#2196f3", "#0d47a1"],
  moonrise: ["#eceff1", "#607d8b", "#263238"],
  spirited: ["#fff3e0", "#e67e22", "#b71c1c"],
};
