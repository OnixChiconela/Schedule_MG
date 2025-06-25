import React from 'react'
import { IconType } from 'react-icons';

interface Props {
    icon: IconType | React.ComponentType<{ size?: number; color?: string }>;
    title: string
    content: string
    from?: string
    via?: string
    to?: string
    smallBg?: string
    iconColor?: string
    soon?: string
    titleColor?: string
    contentSize?: string
    contentColor?: string
    info?: string
    onClickLink?: () => void
}

const InfoCard: React.FC<Props> = ({
    icon: Icon,
    title,
    content,
    from = "from-yellow-50",
    via,
    to = "to-yellow-100/50",
    smallBg = "bg-yellow-600/10",
    titleColor = "text-gray-900",
    iconColor,
    soon,
    contentSize = "text-md",
    contentColor = "text-gray-600",
    info,
    onClickLink
}) => {
    return (
        <div className={`relative overflow-hidden rounded-xl bg-gradient-to-b ${from} ${to} p-8 hover:-translate-y-1 shadow-md hover:shadow-lg transition`}>
            <div className={`mb-5 flex ${soon ? 'justify-between' : "justify-start"} rounded-full ${smallBg} p-3`}>
                <Icon size={24} color={iconColor} />
                {soon ? (
                    <div className='text-[15px] text-neutral-500/90'>
                        {soon}
                    </div>) : (<div />)}
            </div>
            <div className="flex items-start justify-between mb-2">
                <h3 className={`text-xl font-semibold ${titleColor}`}>{title}</h3>
            </div>
            <p className={`${contentColor} ${contentSize} justify-start`}>
                {content} {''}
                <text onClick={onClickLink} className='text-blue-600 cursor-pointer hover:underline'>{info}</text>
            </p>
        </div>
    )
}

export default InfoCard