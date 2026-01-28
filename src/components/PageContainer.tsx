// src/components/PageContainer.tsx
const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gray-100 p-4">
      {children}
    </div>
  );
};

export default PageContainer;
