import Image from "next/image";
import MenuIcon from "@mui/icons-material/Menu";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-[#9bcbe3]">
      <div className="h-full flex items-center justify-between">
        {/* Izquierda: botón historial (solo móvil) + Logo + Título */}
        <div className="flex items-center gap-3 h-full px-4 lg:px-6">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden p-1.5 rounded-lg text-text-secondary hover:text-primary-dark hover:bg-conv-bg transition-colors"
              aria-label="Abrir historial"
            >
              <MenuIcon fontSize="small" />
            </button>
          )}
          <Image
            src="/logo.png"
            alt="Moeve"
            width={98}
            height={18}
            priority
            className="object-contain"
          />
          <span className="text-[#047dba] text-xl font-light font-sans hidden sm:block whitespace-nowrap">
            Sistema de usuarios sintéticos
          </span>
        </div>

        {/* Derecha: Usuario */}
        <div className="flex items-center gap-4 h-full px-4 lg:px-6">
          <div className="bg-[#1b3a5a] rounded-full p-[7px] shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 9C10.6569 9 12 7.65685 12 6C12 4.34315 10.6569 3 9 3C7.34315 3 6 4.34315 6 6C6 7.65685 7.34315 9 9 9ZM9 10.5C6.99 10.5 3 11.505 3 13.5V15H15V13.5C15 11.505 11.01 10.5 9 10.5Z" fill="white"/>
            </svg>
          </div>
          <button className="w-8 h-8 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6L8 10L12 6" stroke="#004656" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
