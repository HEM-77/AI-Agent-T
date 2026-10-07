type HeaderProps = {
  title: string
}

function Header({ title }: HeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Keep track of what you need to do.
      </p>
    </header>
  )
}

export default Header;
