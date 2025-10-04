'use client'

import { cn } from '@gentleduck/libs/cn'
import { AnimVariants } from '@gentleduck/motion/anim'
import * as TooltipPrimitive from '@gentleduck/primitives/tooltip'
import type React from 'react'

function Tooltip({
  skipDelayDuration,
  delayDuration,
  ...props
}: React.ComponentPropsWithRef<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root delayDuration={delayDuration} skipDelayDuration={skipDelayDuration} {...props} />
}

function TooltipTrigger({
  children,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof TooltipPrimitive.Trigger>, 'size'>) {
  return <TooltipPrimitive.Trigger {...props}>{children}</TooltipPrimitive.Trigger>
}

function TooltipContent({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof TooltipPrimitive.Content>): React.JSX.Element {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          AnimVariants(),
          'pointer-events-none relative z-50 h-fit w-fit select-none overflow-hidden text-balance rounded-lg border border-border bg-popover px-3 py-1.5 text-popover-foreground opacity-0 shadow-sm outline-hidden starting:[&[data-open=true]:opacity-0] data-[open=true]:pointer-events-auto data-[open=true]:opacity-100',
          className,
        )}
        ref={ref}
        role="tooltip"
        {...props}>
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

const TooltipPortal = TooltipPrimitive.Portal

export { Tooltip, TooltipTrigger, TooltipContent, TooltipPortal }
