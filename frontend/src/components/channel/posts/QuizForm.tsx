import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import z from 'zod'
import { v4 as uuid } from 'uuid'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../ui/form'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Checkbox } from '../../ui/checkbox'
import { cn } from '@/lib/utils'
import { BiTrash } from 'react-icons/bi'

const quizSchema = z.object({
  answers: z
    .array(
      z.object({
        id: z.string(),
        value: z.string().min(1, 'Answer is required'),
        isCorrect: z.boolean(),
        explain: z.string().optional()
      })
    )
    .min(2, 'At least 2 answers are required')
    .refine(arr => arr.filter(a => a.isCorrect).length === 1, {
      message: 'Exactly one correct answer required',
      path: ['answers']
    })
})

export type QuizFormValues = z.infer<typeof quizSchema>

interface QuizFormProps {
  onSubmit: (data: QuizFormValues) => void
  className?: string
  question: string
  handleCancel: () => void
}

const QuizForm = ({ onSubmit, className, question, handleCancel }: QuizFormProps) => {
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      answers: [
        { id: uuid(), value: '', isCorrect: false, explain: '' },
        { id: uuid(), value: '', isCorrect: false, explain: '' }
      ]
    }
  })

  const { control, handleSubmit } = form

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'answers'
  })

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn('space-y-6 text-white', className)}
      >
        {/* Answers */}
        <div className='space-y-4'>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className='border border-neutral-700 rounded-lg p-3'
            >
              <div className='flex items-center gap-2'>
                {/* isCorrect checkbox */}
                <FormField
                  control={control}
                  name={`answers.${index}.isCorrect`}
                  render={({ field }) => (
                    <FormItem className='flex flex-col items-center justify-center'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={checked => {
                            // uncheck all others, set this one true
                            fields.forEach((_, i) => {
                              update(i, {
                                ...form.getValues(`answers.${i}`),
                                isCorrect: i === index ? !!checked : false
                              })
                            })
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Answer text */}
                <FormField
                  control={control}
                  name={`answers.${index}.value`}
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <Input
                          placeholder={`Answer ${index + 1}`}
                          {...field}
                          className='border-none focus-visible:ring-0'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remove button */}
                <BiTrash
                  className='text-xl cursor-pointer'
                  // variant='destructive'
                  onClick={() => remove(index)}
                />
              </div>

              {field.isCorrect && (
                <FormField
                  control={control}
                  name={`answers.${index}.explain`}
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <Input
                          placeholder='Explanation (optional)'
                          className='border-none focus-visible:ring-0'
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
          ))}

          <Button
            onClick={() =>
              append({
                id: uuid(),
                value: '',
                isCorrect: false,
                explain: ''
              })
            }
            className='w-full border border-neutral-700 rounded-full bg-none hover:bg-neutral-600 text-blue-500 cursor-pointer'
          >
            Add Answer
          </Button>
        </div>


        <div className='flex gap-2 items-center justify-end'>
          <Button variant={'secondary'} onClick={handleCancel}>
            Cancel
          </Button>
          <Button type='submit' disabled={!question || !form.formState.isValid}>
            Post
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default QuizForm
