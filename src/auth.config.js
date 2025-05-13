export const authConfig = {
    providers: [],
    pages: {
      signIn: '/login'
    },
    callbacks: {
      authorized({ auth }) {
        return !!auth?.user
      }
    }
  }