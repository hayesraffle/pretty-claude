// Test file for block visualization
// Hover on the LEFT MARGIN of lines to see block highlighting

function processData(items) {
  const results = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    if (item.type === 'special') {
      results.push(item.value * 2)
    } else {
      results.push(item.value)
    }
  }

  return results
}

class DataProcessor {
  constructor(config) {
    this.config = config
  }

  process(data) {
    try {
      for (const item of data) {
        if (item.valid) {
          this.handleItem(item)
        }
      }
    } catch (error) {
      console.error('Processing failed:', error)
    } finally {
      this.cleanup()
    }
  }

  handleItem(item) {
    switch (item.category) {
      case 'A':
        return this.handleA(item)
      case 'B':
        return this.handleB(item)
      default:
        return null
    }
  }
}

// Nested loops example
function findPairs(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === 10) {
        console.log(`Found pair: ${arr[i]}, ${arr[j]}`)
      }
    }
  }
}
