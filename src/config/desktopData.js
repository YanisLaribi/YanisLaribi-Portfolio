export const desktopIcons = [
  { id: 'about', title: 'About Me', iconUrl: '/info.png', emoji: '🧑‍💻' },
  { id: 'projects', title: 'Projects', iconUrl: '/dossierLogo.png', emoji: '📁' },
  { id: 'experience', title: 'Experience', iconUrl: '/dossierLogo.png', emoji: '📈' },
  { id: 'contacts', title: 'Contacts', iconUrl: '/help.png', emoji: '📇' },
  { id: 'resume', title: 'Download CV', iconUrl: '/user.png', emoji: '📄' },
  { id: 'linkedin', title: 'LinkedIn', iconUrl: '/linkedin.png', emoji: '🔗' },
  { id: 'music', title: 'Music', iconUrl: '/music folder.png', emoji: '🎵' }
]

export const getIconById = (id) => desktopIcons.find(i => i.id === id)
