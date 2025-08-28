import React from 'react'

interface RenderConditionProps {
  condition: boolean
  children: React.ReactNode
}

const RenderCondition = ({ condition, children }: RenderConditionProps) => {
  return <>{condition && children}</>
}

export default RenderCondition
