export type Social = {
  github?: string
  //x?: string
  //juejin?: string
  //qq?: string
  //wx?: string
  //cloudmusic?: string
  zhihu?: string
  //email?: string
  //discord?: string
}

type SocialValue = {
  href?: string
  title: string
  icon: string
  color: string
}

const social: Social = {
  github: 'https://github.com/Fanceir',
  //x: 'https://twitter.com/kuizuo',
  //juejin: 'https://juejin.cn/user/1565318510545901',
  //wx: 'https://img.kuizuo.cn/wechat.png',
  // qq: 'https://img.kuizuo.cn/qq.png',
  zhihu: 'https://www.zhihu.com/people/81-98-85-74',
  //cloudmusic: 'https://music.163.com/#/user/home?id=1333010742',
 // email: 'mailto:hi@kuizuo.cn',
  //discord: 'https://discord.gg/M8cVcjDxkz',
}

const socialSet: Record<keyof Social | 'rss', SocialValue> = {
  github: {
    href: social.github,
    title: 'GitHub',
    icon: 'ri:github-line',
    color: '#010409',
  },
  zhihu: {
    href: social.zhihu,
    title: '知乎',
    icon: 'ri:zhihu-line',
    color: '#1772F6',
  },
  rss: {
    href: '/blog/rss.xml',
    title: 'RSS',
    icon: 'ri:rss-line',
    color: '#FFA501',
  },
}

export default socialSet
