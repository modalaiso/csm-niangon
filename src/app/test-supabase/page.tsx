
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: User } = await supabase.from('User').select()

  return (
    <ul>
      {User?.map((User) => (
        User
      ))}
    </ul>
  )
}
