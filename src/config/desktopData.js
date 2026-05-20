import { projects } from './projects'
import { experiences } from './experience'

export const desktopIcons = [
  { id: 'about', title: 'YanisLaribi', iconUrl: '/YanisLaribi-Portfolio/images/icons/user.svg', emoji: '🧑‍💻' },
  { id: 'projects', title: 'Projects', iconUrl: '/YanisLaribi-Portfolio/images/icons/dossierLogo.png', emoji: '📁' },
  { id: 'experience', title: 'Experience', iconUrl: '/YanisLaribi-Portfolio/images/icons/dossierLogo.png', emoji: '📈' },
  { id: 'contacts', title: 'Contacts', iconUrl: '/YanisLaribi-Portfolio/images/icons/ContactIcone.webp', emoji: '📇' },
  { id: 'resume', title: 'Download CV', iconUrl: '', emoji: '📄' },
  { id: 'linkedin', title: 'LinkedIn', iconUrl: '/YanisLaribi-Portfolio/images/icons/linkedin.svg', emoji: '🔗' },
  { id: 'music', title: 'Music', iconUrl: '/YanisLaribi-Portfolio/images/icons/music folder.png', emoji: '🎵' }
]

export const startMenuIcons = [
  { id: 'about', title: 'YanisLaribi', iconUrl: '/YanisLaribi-Portfolio/images/icons/user.svg', emoji: '🧑‍💻' },
  { id: 'files-explorer', title: 'Files Explorer', iconUrl: '/YanisLaribi-Portfolio/images/icons/dossierLogo.png', emoji: '📁' }
]

export const getIconById = (id) => desktopIcons.find(i => i.id === id) || startMenuIcons.find(i => i.id === id)

export const folders = {
  libraries: {
    id: 'libraries',
    name: 'Libraries',
    path: 'Libraries',
    items: [
      { name: 'Projects', desc: 'Library Folder', type: 'folder', folderId: 'projects', iconUrl: '/YanisLaribi-Portfolio/images/icons/dossierLogo.png', emoji: '📁' },
      { name: 'Experience', desc: 'Library Folder', type: 'folder', folderId: 'experience', iconUrl: '/YanisLaribi-Portfolio/images/icons/dossierLogo.png', emoji: '📈' },
      { name: 'Documents', desc: 'Library Folder', type: 'folder', folderId: 'documents', iconUrl: '/YanisLaribi-Portfolio/images/icons/dossierLogo.png', emoji: '📄' }
    ]
  },
  projects: {
    id: 'projects',
    name: 'Projects',
    path: 'Libraries ▸ Projects',
    items: projects
  },
  favorites: {
    id: 'favorites',
    name: 'Favorites',
    path: 'Libraries ▸ Favorites',
    items: [
      ...projects.filter(p => p.id === 'batibloc'),
      ...projects.filter(p => p.id === 'portfolio-website'),
      ...experiences.filter(e => e.id === 'eccc-intern')
    ]
  },
  experience: {
    id: 'experience',
    name: 'Experience',
    path: 'Libraries ▸ Experience',
    items: experiences
  },
  documents: {
    id: 'documents',
    name: 'Documents',
    path: 'Libraries ▸ Documents',
    items: [
      { name: 'Resume-summer2026.pdf', desc: 'PDF Document', type: 'resume', emoji: '📄' }
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
  
  // Search in actual projects directly
  projects.forEach(item => {
    if (item.name.toLowerCase().includes(q) || (item.content && item.content.toLowerCase().includes(q))) {
      results.push({
        title: item.name,
        desc: item.desc,
        iconUrl: item.iconUrl || '/YanisLaribi-Portfolio/images/icons/dossierLogo.png',
        emoji: item.emoji || '📄',
        type: 'project',
        originalItem: item
      })
    }
  })

  // Search in experiences directly
  experiences.forEach(item => {
    if (item.name.toLowerCase().includes(q) || (item.content && item.content.toLowerCase().includes(q))) {
      results.push({
        title: item.name,
        desc: item.desc,
        iconUrl: item.iconUrl || '/YanisLaribi-Portfolio/images/icons/dossierLogo.png',
        emoji: item.emoji || '📄',
        type: 'experience',
        originalItem: item
      })
    }
  })

  // Search in other documents
  folders.documents.items.forEach(item => {
    if (item.name.toLowerCase().includes(q)) {
      results.push({
        title: item.name,
        desc: item.desc,
        iconUrl: item.iconUrl || '/YanisLaribi-Portfolio/images/icons/dossierLogo.png',
        emoji: item.emoji || '📄',
        type: item.type,
        originalItem: item
      })
    }
  })
  
  return results
}
