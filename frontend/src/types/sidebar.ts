export type SidebarStatus = 'large' | 'small' | 'close'
export interface SidebarProps {
    sidebarStatus?: SidebarStatus
    setSidebarStatus?: React.Dispatch<React.SetStateAction<SidebarStatus>>
}