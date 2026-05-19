export const desktopIcons = [
  { id: 'about', title: 'YanisLaribi', iconUrl: '/user.png', emoji: '🧑‍💻' },
  { id: 'projects', title: 'Projects', iconUrl: '/dossierLogo.png', emoji: '📁' },
  { id: 'experience', title: 'Experience', iconUrl: '/dossierLogo.png', emoji: '📈' },
  { id: 'contacts', title: 'Contacts', iconUrl: '/ContactIcone.webp', emoji: '📇' },
  { id: 'resume', title: 'Download CV', iconUrl: '', emoji: '📄' },
  { id: 'linkedin', title: 'LinkedIn', iconUrl: '/linkedin.png', emoji: '🔗' },
  { id: 'music', title: 'Music', iconUrl: '/music folder.png', emoji: '🎵' }
]

export const startMenuIcons = [
  { id: 'about', title: 'YanisLaribi', iconUrl: '/user.png', emoji: '🧑‍💻' },
  { id: 'files-explorer', title: 'Files Explorer', iconUrl: '/dossierLogo.png', emoji: '📁' }
]

export const getIconById = (id) => desktopIcons.find(i => i.id === id) || startMenuIcons.find(i => i.id === id)

export const folders = {
  projects: {
    id: 'projects',
    name: 'Projects',
    path: 'Libraries ▸ Projects',
    items: [
      { name: 'BatiBloc', desc: 'Construction simulation with 2D/3D visualization.', type: 'project' },
      { name: 'Medical Case Simulator', desc: '3-tier web app for clinical simulations.', type: 'project' },
      { name: 'CANLock', desc: 'AI anomaly detection on CAN bus vehicular networks.', type: 'project' },
      { name: 'Web Automation Agent', desc: 'Autonomous agent bypassing anti-bot mechanisms.', type: 'project' }
    ]
  },
  favorites: {
    id: 'favorites',
    name: 'Favorites',
    path: 'Libraries ▸ Favorites',
    items: [
      { name: 'BatiBloc', desc: 'Construction simulation with 2D/3D visualization.', type: 'project' },
      { name: 'CANLock', desc: 'AI anomaly detection on CAN bus vehicular networks.', type: 'project' },
      { name: 'Web Automation Agent', desc: 'Autonomous agent bypassing anti-bot mechanisms.', type: 'project' }
    ]
  },
  experience: {
    id: 'experience',
    name: 'Experience',
    path: 'Libraries ▸ Experience',
    items: [
      { name: 'Data Science Intern', desc: 'Federal Government of Canada (ECCC) | May–Aug 2026', type: 'experience' },
      { name: 'Researcher', desc: 'SGD Beyond (ML Club) | 2025–2026', type: 'experience' }
    ]
  },
  documents: {
    id: 'documents',
    name: 'Documents',
    path: 'Libraries ▸ Documents',
    items: [
      { name: 'Resume-summer2026', desc: 'PDF Document', type: 'resume', emoji: '📄' }
    ]
  },
  desktop: {
    id: 'desktop',
    name: 'Desktop',
    path: 'Favorites ▸ Desktop',
    items: desktopIcons.map(icon => ({
      name: icon.title,
      desc: 'Shortcut',
      type: 'app',
      appId: icon.id,
      iconUrl: icon.iconUrl,
      emoji: icon.emoji
    }))
  }
}

export function searchAll(query) {
  if (!query) return []
  const q = query.toLowerCase()
  
  const results = []
  
  // Search apps
  desktopIcons.forEach(icon => {
    if (icon.title.toLowerCase().includes(q)) {
      results.push({
        title: icon.title,
        iconUrl: icon.iconUrl,
        emoji: icon.emoji,
        type: 'app',
        originalApp: icon
      })
    }
  })
  
  // Search folder items
  const folderKeys = ['projects', 'experience', 'documents'] // Skip favorites to avoid duplicates, desktop is covered by desktopIcons
  folderKeys.forEach(key => {
    folders[key].items.forEach(item => {
      if (item.name.toLowerCase().includes(q) || (item.desc && item.desc.toLowerCase().includes(q))) {
        results.push({
          title: item.name,
          desc: item.desc,
          iconUrl: item.iconUrl || '/dossierLogo.png', // Or whatever icon
          emoji: item.emoji || '📄',
          type: item.type,
          originalItem: item
        })
      }
    })
  })
  
  return results
}
