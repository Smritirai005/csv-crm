// Splits a large array into fixed-size chunks. Kept as its own tiny
// module so it's independently testable and the intent is obvious.

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

module.exports = { chunkArray };
