import { IconType } from "react-icons"
import Card from "./Card"
import { useTheme } from "@/app/themeContext";


const InfoCard = ({
  icon: Icon,
  title,
  content,
  iconColor,
  contentColor,
  soon,
  contentSize,
  className
}: {
  icon: IconType
  title: string
  content: string
  iconColor?: string
  contentColor?: string
  soon?: string
  contentSize?: string
  className?: string
}) => {
  const { theme } = useTheme();

  return (
    <div className={`relative transition-all hover:-translate-y-1 items-center ${className}`}>
      <Card className="h-full flex flex-col">
        <div className="p-6 flex flex-col gap-2 flex-grow">
          <div className="flex items-center justify-between">
            <div
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${theme == "light" ? 'bg-fuchsia-100' : "bg-slate-800"} ${iconColor === 'fuchsia' ? 'text-fuchsia-600' : 'text-white'}`}
            >
              <Icon size={24} />
            </div>
            {soon && (
              <span className={`text-xs ${theme == "light" ? "bg-fuchsia-100" : "bg-fuchsia-950/20"} text-fuchsia-600 px-2 py-1 rounded`}>
                {soon}
              </span>
            )}
          </div>
          <h3 className={`font-semibold text-lg ${theme == "light" ? "text-gray-800" : "text-neutral-300"}`}>{title}</h3>
          <p className={`${contentSize || 'text-base'} ${theme == "light" ? contentColor : 'text-neutral-400'}`}>{content}</p>
        </div>
      </Card>
    </div>
  )
}

export default InfoCard