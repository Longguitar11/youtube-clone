import { Fragment } from 'react'

export function formatDescription (text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g

  return text.split(urlRegex).map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-500 hover:underline'
        >
          {part}
        </a>
      )
    }
    // Replace \n with <br /> so double newlines stay
    return part.split('\n').map((line, j, arr) => (
      <Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </Fragment>
    ))
  })
}
