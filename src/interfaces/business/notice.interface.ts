export interface INotice {
  id: string
  kind: 'booking' | 'cancel' | 'reschedule'
  title: string
  body: string
  read: boolean
  createdAt: string
}

export interface INoticeList {
  unread: number
  items: INotice[]
}
