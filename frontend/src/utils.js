/**
 * CONCEPT: Emojis as visual labels
 * Each COCO class gets a relevant emoji for the UI.
 * This makes the output feel conversational and "humanoid".
 */
export const CLASS_EMOJIS = {
  person: '🧑', bicycle: '🚲', car: '🚗', motorcycle: '🏍️',
  airplane: '✈️', bus: '🚌', train: '🚂', truck: '🚛',
  boat: '⛵', 'traffic light': '🚦', 'fire hydrant': '🚒',
  'stop sign': '🛑', 'parking meter': '🅿️', bench: '🪑',
  bird: '🐦', cat: '🐱', dog: '🐶', horse: '🐴',
  sheep: '🐑', cow: '🐄', elephant: '🐘', bear: '🐻',
  zebra: '🦓', giraffe: '🦒', backpack: '🎒', umbrella: '☂️',
  handbag: '👜', tie: '👔', suitcase: '🧳', frisbee: '🥏',
  skis: '⛷️', snowboard: '🏂', 'sports ball': '⚽',
  kite: '🪁', 'baseball bat': '⚾', 'baseball glove': '🧤',
  skateboard: '🛹', surfboard: '🏄', 'tennis racket': '🎾',
  bottle: '🍶', 'wine glass': '🍷', cup: '☕',
  fork: '🍴', knife: '🔪', spoon: '🥄', bowl: '🥣',
  banana: '🍌', apple: '🍎', sandwich: '🥪', orange: '🍊',
  broccoli: '🥦', carrot: '🥕', 'hot dog': '🌭', pizza: '🍕',
  donut: '🍩', cake: '🎂', chair: '🪑', couch: '🛋️',
  'potted plant': '🪴', bed: '🛏️', 'dining table': '🍽️',
  toilet: '🚽', tv: '📺', laptop: '💻', mouse: '🖱️',
  remote: '📱', keyboard: '⌨️', 'cell phone': '📱',
  microwave: '📡', oven: '🍳', toaster: '🍞',
  sink: '🚰', refrigerator: '🧊', book: '📚',
  clock: '🕐', vase: '🏺', scissors: '✂️',
  'teddy bear': '🧸', 'hair drier': '💨', toothbrush: '🪥',
};

export const getEmoji = (className) =>
  CLASS_EMOJIS[className.toLowerCase()] ?? '🔍';

/**
 * Maps confidence to a human-readable quality label.
 */
export const getConfidenceLabel = (confidence) => {
  if (confidence >= 0.9) return { label: 'Very High', color: '#34d399' };
  if (confidence >= 0.75) return { label: 'High', color: '#63b3ff' };
  if (confidence >= 0.55) return { label: 'Medium', color: '#fb923c' };
  return { label: 'Low', color: '#f87171' };
};

/**
 * Formats the bounding box for display.
 */
export const formatBbox = (bbox) =>
  `x1:${bbox.x1} y1:${bbox.y1}\nx2:${bbox.x2} y2:${bbox.y2}\n${bbox.width}×${bbox.height}px`;
