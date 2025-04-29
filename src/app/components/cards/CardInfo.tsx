import { IconType } from "react-icons"
import Card from "./Card"
import { useTheme } from "@/app/themeContext";


const InfoCard = ({
  icon: Icon,
  title,
  content,
  smallBg,
  iconColor,
  contentColor,
  soon,
  contentSize,
}: {
  icon: IconType
  title: string
  content: string
  smallBg?: string
  iconColor?: string
  contentColor?: string
  soon?: string
  contentSize?: string
}) => {
  const { theme } = useTheme();

  return (
    <div className="relative transition-all hover:-translate-y-1 items-center">
      <Card>
        <div className="p-6 flex flex-col gap-2">
          <div
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${smallBg || 'bg-fuchsia-100'
              } ${iconColor === 'fuchsia' ? 'text-fuchsia-600' : 'text-white'}`}
          >
            <Icon size={24} />
          </div>
          <h3 className={`font-semibold text-lg ${theme == "light" ? "text-gray-800" : "text-neutral-300"}`}>{title}</h3>
          <p className={`${contentSize || 'text-base'} ${theme == "light" ? contentColor : 'text-neutral-400'}`}>{content}</p>
          {soon && (
            <span className="absolute top-2 right-2 text-xs text-fuchsia-600 bg-fuchsia-100 px-2 py-1 rounded">
              {soon}
            </span>
          )}
        </div>
      </Card>
    </div>
  )
}

export default InfoCard