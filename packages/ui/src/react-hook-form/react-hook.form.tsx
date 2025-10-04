'use client'

import { cn } from '@gentleduck/libs/cn'
import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form'
import { Label } from '../label'

const Form = FormProvider
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}
const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)
  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }
  const { id } = itemContext
  return {
    formDescriptionId: `${id}-form-item-description`,
    formItemId: `${id}-form-item`,
    formMessageId: `${id}-form-item-message`,
    id,
    name: fieldContext.name,
    ...fieldState,
  }
}
type FormItemContextValue = {
  id: string
}
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)
function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn('grid gap-2', className)} duck-form-item="" {...props} />
    </FormItemContext.Provider>
  )
}
function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField()
  return (
    <Label
      className={cn('data-[error=true]:text-destructive', className)}
      data-error={!!error}
      duck-form-label=""
      htmlFor={formItemId}
      {...props}
    />
  )
}
function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  return (
    <Slot
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      duck-form-control=""
      id={formItemId}
      {...props}
    />
  )
}
function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField()
  return (
    <p
      className={cn('text-muted-foreground text-sm', className)}
      duck-form-description=""
      id={formDescriptionId}
      {...props}
    />
  )
}
function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? '') : props.children
  if (!body) {
    return null
  }
  return (
    <p className={cn('text-destructive text-sm', className)} duck-form-message="" id={formMessageId} {...props}>
      {body}
    </p>
  )
}
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }
