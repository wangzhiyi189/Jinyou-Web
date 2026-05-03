export const orderStatusOptions = [
  {
    value: 0,
    label: '待付款',
    color:'#666'
  },
  {
    value: 1,
    label: '已支付',
    color: '#2db7f5'
  },
  {
    value: 2,
    label: '已出票',
    color:'#108ee9'
  },
  {
    value: 3,
    label: '已取消',
    color:'#f50'
  },
  {
    value: 4,
    label: '已退票',
    color:'#cd201f'
  },
  {
    value: 5,
    label: '已出行',
    color:'#3d7526'
  },
]

export function getOrderStatusLabel(status: number,name: string = 'label') {
  const option = orderStatusOptions.find(item => item.value === status)
  return option?.[name] || '未知'
}