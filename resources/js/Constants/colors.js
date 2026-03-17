// resources/js/constants/colors.js

export const pastelColors = [
  'bg-rose-50',
  'bg-blue-50',
  'bg-green-50',
  'bg-yellow-50',
  'bg-purple-50',
  'bg-pink-50',
  'bg-indigo-50',
  'bg-orange-50'
];

// Pour alterner les couleurs dans une section
export const getPastelColor = (index) => {
  return pastelColors[index % pastelColors.length];
};