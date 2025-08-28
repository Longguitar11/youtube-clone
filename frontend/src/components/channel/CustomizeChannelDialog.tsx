import React, { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '../ui/dialog'
import { Button } from '../ui/button'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { cn } from '@/lib/utils'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useAppContext } from '@/context/useAppContext'
import { Textarea } from '../ui/textarea'

const channelSchema = z.object({
  bannerUrl: z.string().optional(),
  profileUrl: z.string().optional(),
  description: z.string().optional(),
  displayName: z
    .string()
    .min(2, 'Display name is required')
    .refine(val => val.startsWith('@'), 'Display name must start with @')
    .refine(
      val => (val.match(/@/g) || []).length === 1,
      'Handle contains unsupported characters'
    )
    .refine(val => !/\s/.test(val), {
      message: 'Display name cannot contain spaces'
    }),
  name: z.string().min(1, 'Name is required')
})

export type ChannelFormValues = z.infer<typeof channelSchema>

interface CustomizeChannelDialogProps {
  isOpen: boolean
  isSubmitting: boolean
  onSubmit: (data: ChannelFormValues) => void
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  className?: string
  buttonClassName?: string
}

const CustomizeChannelDialog = ({
  isOpen,
  isSubmitting,
  setIsOpen,
  onSubmit,
  className,
  buttonClassName
}: CustomizeChannelDialogProps) => {
  const { user } = useAppContext()

  const { name, displayName, description, bannerUrl, profileUrl } =
    user?.channel || {}

  const [previewImages, setPreviewImages] = useState({
    bannerUrl,
    profileUrl
  })

  const bannerUrlRef = useRef<HTMLInputElement>(null)
  const profileUrlRef = useRef<HTMLInputElement>(null)

  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
    mode: 'onChange',
    defaultValues: {
      name,
      displayName,
      description,
      profileUrl,
      bannerUrl
    }
  })

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { isValid, isDirty },
    reset,
    watch
  } = form

  const currentValues = watch()
  const hasChanges = (
    Object.keys(currentValues) as Array<keyof ChannelFormValues>
  ).some(key => currentValues[key]?.trim() !== user?.channel?.[key]?.trim())

  const handleImage = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'profileUrl' | 'bannerUrl'
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewImages(prev => ({ ...prev, [field]: url }))

      const reader = new FileReader()
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        setValue(field, reader.result as string, { shouldDirty: true })
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    // reset values when dialog is closed
    if (!isOpen) {
      reset()
      setPreviewImages({ bannerUrl, profileUrl })
    }
  }, [isOpen])

  useEffect(() => {
    if (user?.channel) {
      setPreviewImages({ bannerUrl, profileUrl })
      reset({
        displayName: displayName || '',
        name: name || '',
        description: description || '',
        profileUrl: profileUrl || '',
        bannerUrl: bannerUrl || ''
      })
    }
  }, [user?.channel])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={cn('rounded-full', buttonClassName)} onClick={() => setIsOpen(true)}>
          Customize channel
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-y-auto text-white bg-neutral-900 border-none'>
        <DialogHeader>
          <DialogTitle className='text-center'>Customize Channel</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={cn('space-y-6', className)}
          >
            <div className='space-y-4'>
              <Label className=''>Banner image</Label>
              <div className='flex gap-4 items-center'>
                <img
                  src={previewImages.bannerUrl || '/banner-placeholder.png'}
                  alt={name}
                  className='w-24 object-cover'
                />
                <FormField
                  control={control}
                  name={`bannerUrl`}
                  render={() => (
                    <FormItem className='hidden'>
                      <FormControl>
                        <Input
                          ref={bannerUrlRef}
                          type='file'
                          accept='image/*'
                          placeholder='Banner URL'
                          onChange={e => handleImage(e, 'bannerUrl')}
                          className='text-white'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className='flex gap-4 items-center'>
                  <Button
                    type='button'
                    onClick={() => bannerUrlRef.current?.click()}
                  >
                    Change
                  </Button>
                  <Button
                    type='button'
                    onClick={() => {
                      if (getValues('bannerUrl'))
                        setValue('bannerUrl', '', { shouldDirty: true })
                      if (previewImages.bannerUrl)
                        setPreviewImages(prev => ({ ...prev, bannerUrl: '' }))
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <Label className=''>Profile image</Label>
              <div className='flex gap-4 items-center'>
                <img
                  src={previewImages.profileUrl || '/user.png'}
                  alt={name}
                  className='size-24 object-cover rounded-full shrink-0'
                />
                <FormField
                  control={control}
                  name={`profileUrl`}
                  render={() => (
                    <FormItem className='hidden'>
                      <FormControl>
                        <Input
                          ref={profileUrlRef}
                          type='file'
                          accept='image/*'
                          placeholder='Profile URL'
                          onChange={e => handleImage(e, 'profileUrl')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className='flex gap-4 items-center'>
                  <Button
                    type='button'
                    onClick={() => profileUrlRef.current?.click()}
                  >
                    Change
                  </Button>
                  <Button
                    type='button'
                    onClick={() => {
                      if (getValues('profileUrl'))
                        setValue('profileUrl', '', { shouldDirty: true })
                      if (previewImages.profileUrl) {
                        setPreviewImages(prev => ({ ...prev, profileUrl: '' }))
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <FormField
                control={control}
                name={`name`}
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormControl>
                      <Input placeholder={`Name`} {...field} className='' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`displayName`}
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormControl>
                      <Input
                        placeholder={`Display name`}
                        {...field}
                        onChange={e => {
                          let value = e.target.value
                          if (!value.startsWith('@')) {
                            value = '@' + value
                          }
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`description`}
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormControl>
                      <Textarea
                        placeholder={`Description`}
                        {...field}
                        className=''
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant={'secondary'}>Cancel</Button>
                </DialogClose>
                <Button
                  type='submit'
                  disabled={!isValid || !isDirty || !hasChanges || isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CustomizeChannelDialog
