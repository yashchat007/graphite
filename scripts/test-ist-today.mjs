import assert from 'node:assert'

const IST = 'Asia/Kolkata'

function istYmd(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const formatted = new Intl.DateTimeFormat('en-US', {
  timeZone: IST,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
}).format(new Date())

assert.match(formatted, /\d{1,2}:\d{2}\s(?:AM|PM)/)
assert.match(istYmd(), /^\d{4}-\d{2}-\d{2}$/)
console.log('ist-today tests passed')
