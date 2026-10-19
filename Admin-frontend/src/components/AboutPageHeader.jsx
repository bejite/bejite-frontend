export default function AboutPageHeader({ headerText }) {
  return (
    <header className="w-full px-2 py-3 flex justify-center items-center max-w-full mx-auto bg-[#16730F] text-white gap-4">
      <img src="/assets/images/logo.png" alt="logo" className="h-12 sm:h-16" />
      <div className="bg-[#6B8E23] w-0.5 h-12"></div>
      <p className="font-medium">{headerText}</p>
    </header>
  );
}
