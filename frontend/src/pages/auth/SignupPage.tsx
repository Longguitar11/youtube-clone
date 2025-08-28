import { FaGoogle } from 'react-icons/fa'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '@/api/auth'
import toast from 'react-hot-toast'
import { useAppContext } from '@/context/useAppContext'

const formSchema = z
  .object({
    email: z.email({ pattern: z.regexes.email }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' })
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'] // path of error
  })

const SignupPage = () => {
  const navigate = useNavigate()

  const { setUser } = useAppContext()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  async function onSubmit (values: z.infer<typeof formSchema>) {
    const { email, password } = values

    const { message, user, error } = await signup({ email, password })

    if (error) {
      toast.error(error)
    }

    if (message && user) {
      setUser(user)
      navigate('/')
    }
  }

  return (
    <div className='h-screen flex items-center justify-center'>
      <div className='w-96 space-y-4'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-8 rounded shadow p-4'
          >
            <p className='text-2xl text-blue-500 font-bold text-center'>
              SIGN UP
            </p>

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter your email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter your password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter your confirm password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='w-full bg-blue-500 hover:opacity-80'
            >
              Submit
            </Button>
          </form>
        </Form>

        <a href='http://localhost:5000/api/auth/google'>
          <div className='flex gap-2 items-center justify-center p-2 border border-primary rounded cursor-pointer hover:opacity-80 transition-opacity duration-200 w-full'>
            <FaGoogle className='text-2xl text-primary' />
            <button className='text-shadow-primary-foreground cursor-pointer'>
              Sign in with Google
            </button>
          </div>
        </a>

        <div className='flex gap-2 items-center justify-center mt-4'>
          <p>You already have an account?</p>
          <Link to='/login' className='text-blue-500'>
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
