interface PageProps {
  children: React.ReactNode;
}

const Layout = ({ children }: PageProps) => {
  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  );
};

export default Layout;