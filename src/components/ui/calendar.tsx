import * as React from "react"

export type CalendarProps = React.ComponentProps<"div">

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <div
      className={className}
      {...props}
    />
  )
}

export { Calendar }
