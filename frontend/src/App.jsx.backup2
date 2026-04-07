import React, { useState, useEffect } from 'react'
import { licenseManager } from './utils/licenseManager'

// Catégories fixes (Important Non-Urgent)
const FIXED_CATEGORIES = [
  { id: 1, name: 'Charges', description: 'Dépenses récurrentes (loyer, électricité, etc.)', icon: '💳', color: '#ef4444' },
  { id: 2, name: 'Investissement', description: 'Projets d\'investissement', icon: '📈', color: '#3b82f6' },
  { id: 3, name: 'Épargne', description: 'Épargne mensuelle', icon: '🏦', color: '#22c55e' },
  { id: 4, name: 'Fonds d\'urgence', description: 'Réserve de sécurité', icon: '🆘', color: '#f59e0b' },
]

// Sous-catégories par défaut pour Charges
const DEFAULT_CHARGES_SUBCATEGORIES = [
  { id: 'charges-1', categoryId: 1,  name: 'Alimentation', description: 'Courses alimentaires quotidiennes', icon: '🛒', color: '#f97316' },
  { id: 'charges-2', categoryId: 1,  name: 'Electricité', description: "Facture d'électricité", icon: '⚡', color: '#eab308' },
  { id: 'charges-3', categoryId: 1,  name: 'Eau', description: "Facture d'eau", icon: '💧', color: '#3b82f6' },
  { id: 'charges-4', categoryId: 1,  name: 'Scolarité des enfants', description: 'Frais de scolarité et fournitures', icon: '📚', color: '#8b5cf6' },
  { id: 'charges-5', categoryId: 1,  name: 'Conjoint(e)', description: 'Dépenses du conjoint ou conjointe', icon: '👫', color: '#ec4899' },
  { id: 'charges-6', categoryId: 1,  name: 'Famille', description: 'Dépenses familiales diverses', icon: '👨‍👩‍👧‍👦', color: '#f43f5e' },
  { id: 'charges-7', categoryId: 1,  name: 'Travail', description: 'Dépenses professionnelles', icon: '💼', color: '#6366f1' },
  { id: 'charges-8', categoryId: 1,  name: 'Personnel', description: 'Dépenses personnelles', icon: '👤', color: '#14b8a6' },
  { id: 'charges-9', categoryId: 1,  name: 'Intérêts', description: 'Intérêts des emprunts', icon: '📊', color: '#a855f7' },
  { id: 'charges-10', categoryId: 1,  name: 'Loyer/Hypothèque', description: 'Logement', icon: '🏠', color: '#ef4444' },
  { id: 'charges-11', categoryId: 1,  name: 'Internet/Téléphonie', description: 'Connexion et télécom', icon: '📱', color: '#06b6d4' },
  { id: 'charges-12', categoryId: 1,  name: 'Assurance', description: 'Assurances diverses', icon: '🛡️', color: '#10b981' },
  { id: 'charges-13', categoryId: 1,  name: 'Transport', description: 'Essence, transports en commun', icon: '🚗', color: '#f59e0b' },
]

// Quadrants Eisenhower principaux
const EISENHOWER_QUADRANTS = [
  { id: 1, name: 'Précipitations', description: 'Signe d\'échec personnel', color: '#dc2626', bgColor: 'bg-red-500' },
  { id: 2, name: 'Planification', description: 'Route vers le succès', color: '#16a34a', bgColor: 'bg-green-500', hasMatrix: true },
  { id: 3, name: 'Problèmes', description: 'Les aléas de la vie', color: '#eab308', bgColor: 'bg-yellow-500' },
  { id: 4, name: 'Pulsions', description: 'À gérer et dominer', color: '#6b7280', bgColor: 'bg-gray-500' },
]

export default function App() {
  const [view, setView] = useState('main-matrix')
  const [menuOpen, setMenuOpen] = useState(false)
  const [licenseInfo, setLicenseInfo] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [subcategories, setSubcategories] = useState(() => {
    const saved = localStorage.getItem('gosen-subcategories')
    const savedSubcategories = saved ? JSON.parse(saved) : []
    
    // Always include DEFAULT_CHARGES_SUBCATEGORIES (remove any existing Charges subcategories first)
    const otherSubcategories = savedSubcategories.filter(sub => sub.categoryId !== 1)
    return [...DEFAULT_CHARGES_SUBCATEGORIES, ...otherSubcategories]
  })
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('gosen-entries')
    return saved ? JSON.parse(saved) : []
  })
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('gosen-tasks')
    return saved ? JSON.parse(saved) : []
  })
  const [modals, setModals] = useState({
    subcategory: false,
    entry: false,
    task: false,
    settings: false,
  })
  const [formData, setFormData] = useState({})
  const [periodFilter, setPeriodFilter] = useState('week')
  const [dashboardFilter, setDashboardFilter] = useState('week')
  const [urgencyHours, setUrgencyHours] = useState(() => {
    const saved = localStorage.getItem('gosen-urgency-hours')
    return saved ? parseInt(saved) : 24
  })
  const [monthStartDay, setMonthStartDay] = useState(() => {
    const saved = localStorage.getItem('gosen-month-start')
    return saved ? parseInt(saved) : 25
  })

  // Configuration des devises disponibles
  const CURRENCIES = [
    { code: 'EUR', symbol: '€', name: 'Euro (€)' },
    { code: 'USD', symbol: '$', name: 'Dollar américain ($)' },
    { code: 'FCFA', symbol: 'FCFA', name: 'Franc CFA' },
    { code: 'GBP', symbol: '£', name: 'Livre sterling (£)' },
    { code: 'CAD', symbol: 'C$', name: 'Dollar canadien (C$)' },
    { code: 'CHF', symbol: 'CHF', name: 'Franc suisse (CHF)' },
    { code: 'JPY', symbol: '¥', name: 'Yen japonais (¥)' },
    { code: 'XOF', symbol: 'CFA', name: 'Franc CFA Ouest (CFA)' },
    { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA Centre (FCFA)' },
  ]

  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('gosen-currency')
    return saved ? JSON.parse(saved) : CURRENCIES[0] // EUR par défaut
  })

  const [backupReminderEnabled, setBackupReminderEnabled] = useState(() => {
    const saved = localStorage.getItem('gosen-backup-reminder-enabled')
    return saved ? JSON.parse(saved) : false
  })
  const [backupReminderFrequency, setBackupReminderFrequency] = useState(() => {
    const saved = localStorage.getItem('gosen-backup-reminder-frequency')
    return saved || 'week'
  })
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [editingEntry, setEditingEntry] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [editingSubcategory, setEditingSubcategory] = useState(null)
  const [showArchived, setShowArchived] = useState(false)

  // Effacer l'indicateur d'édition quand on ferme une modale
  const closeModals = () => {
    setModals({ subcategory: false, entry: false, task: false, settings: false })
    setEditingEntry(null)
    setEditingTask(null)
    setEditingSubcategory(null)
    setFormData({})
  }

  // Persistance des données
  useEffect(() => {
    localStorage.setItem('gosen-subcategories', JSON.stringify(subcategories))
  }, [subcategories])

  useEffect(() => {
    localStorage.setItem('gosen-entries', JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem('gosen-tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('gosen-urgency-hours', urgencyHours.toString())
  }, [urgencyHours])

  useEffect(() => {
    localStorage.setItem('gosen-month-start', monthStartDay.toString())
  }, [monthStartDay])

  useEffect(() => {
    localStorage.setItem('gosen-currency', JSON.stringify(currency))
  }, [currency])

  useEffect(() => {
    localStorage.setItem('gosen-backup-reminder-enabled', JSON.stringify(backupReminderEnabled))
  }, [backupReminderEnabled])

  useEffect(() => {
    const data = licenseManager.getData()
    if (data && data.email) {
      const phone = data.email.split('@')[0]
      setLicenseInfo({
        phone: phone,
        status: data.status,
        expiresAt: data.expiresAt,
        type: data.status === 'trial' ? 'Essai' : (data.expiresAt === null ? 'Illimité' : 'Actif')
      })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('gosen-backup-reminder-frequency', backupReminderFrequency)
  }, [backupReminderFrequency])

  // Gestion des notifications et rappels de sauvegarde
  useEffect(() => {
    // Vérifier la permission de notification
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)

      // Demander la permission si les rappels sont activés
      if (backupReminderEnabled && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission)
        })
      }
    }
  }, [backupReminderEnabled])

  useEffect(() => {
    if (!backupReminderEnabled || notificationPermission !== 'granted') return

    // Calculer le prochain rappel selon la fréquence
    const scheduleNextReminder = () => {
      const now = new Date()
      let nextReminder = new Date()

      switch (backupReminderFrequency) {
        case 'day':
          // Demain à 9h
          nextReminder.setDate(now.getDate() + 1)
          nextReminder.setHours(9, 0, 0, 0)
          break
        case 'week':
          // Lundi prochain à 9h
          const dayOfWeek = now.getDay()
          const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7
          nextReminder.setDate(now.getDate() + daysUntilMonday)
          nextReminder.setHours(9, 0, 0, 0)
          break
        case 'month':
          // Le 1er du mois prochain à 9h
          nextReminder.setMonth(now.getMonth() + 1, 1)
          nextReminder.setHours(9, 0, 0, 0)
          break
        case 'quarter':
          // Tous les 3 mois
          nextReminder.setMonth(now.getMonth() + 3)
          nextReminder.setDate(1)
          nextReminder.setHours(9, 0, 0, 0)
          break
      }

      const delay = nextReminder.getTime() - now.getTime()

      const timeoutId = setTimeout(() => {
        // Envoyer la notification
        new Notification('💾 Gosen Success - Sauvegarde', {
          body: 'N\'oubliez pas de sauvegarder vos données ! Cliquez pour exporter.',
          icon: '💾',
          tag: 'backup-reminder',
          requireInteraction: true
        })

        // Programmer le prochain rappel
        scheduleNextReminder()
      }, delay)

      return () => clearTimeout(timeoutId)
    }

    scheduleNextReminder()
  }, [backupReminderEnabled, backupReminderFrequency, notificationPermission])

  const getPeriodDates = (filter = periodFilter) => {
    const now = new Date()

    switch (filter) {
      case 'day':
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        return { start: startOfDay, end: endOfDay }

      case 'week':
        const dayOfWeek = now.getDay()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
        startOfWeek.setHours(0, 0, 0, 0)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        return { start: startOfWeek, end: endOfWeek }

      case 'month':
        const currentDay = now.getDate()
        let startOfMonth, endOfMonth

        if (currentDay >= monthStartDay) {
          startOfMonth = new Date(now.getFullYear(), now.getMonth(), monthStartDay, 0, 0, 0)
          endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, monthStartDay - 1, 23, 59, 59)
        } else {
          startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, monthStartDay, 0, 0, 0)
          endOfMonth = new Date(now.getFullYear(), now.getMonth(), monthStartDay - 1, 23, 59, 59)
        }
        return { start: startOfMonth, end: endOfMonth }

      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        return { start: startOfYear, end: endOfYear }

      default:
        return { start: now, end: now }
    }
  }

  const filterEntriesByPeriod = (entriesList, filter = periodFilter) => {
    const { start, end } = getPeriodDates(filter)
    return entriesList.filter(entry => {
      const entryDate = new Date(entry.dueDate)
      return entryDate >= start && entryDate <= end
    })
  }

  const isUrgentEntry = (entry) => {
    if (!entry.dueDate || entry.completed) return false
    const now = new Date()
    const dueDate = new Date(entry.dueDate)
    const diffHours = (dueDate - now) / (1000 * 60 * 60)
    return diffHours > 0 && diffHours <= urgencyHours
  }

  const getUrgentEntries = () => {
    return entries.filter(entry => isUrgentEntry(entry) && !entry.archived)
  }

  const openEntryModal = () => {
    setEditingEntry(null)
    setFormData({})
    setModals({ ...modals, entry: true })
  }

  const editEntry = (entry) => {
    setEditingEntry(entry)
    setFormData({
      name: entry.name,
      cost: entry.cost,
      entryType: entry.entryType || 'cost',
      description: entry.description,
      dueDate: entry.dueDate,
    })
    setModals({ ...modals, entry: true })
  }

  const saveEntry = (e) => {
    e.preventDefault()

    if (editingEntry) {
      setEntries(entries.map(entry =>
        entry.id === editingEntry.id
          ? {
              ...entry,
              name: formData.name,
              cost: formData.cost || '0',
              entryType: formData.entryType || 'cost',
              description: formData.description || '',
              dueDate: formData.dueDate || entry.dueDate,
            }
          : entry
      ))
    } else {
      const newEntry = {
        id: Date.now().toString(),
        subcategoryId: selectedSubcategory.id,
        name: formData.name,
        cost: formData.cost || '0',
        entryType: formData.entryType || 'cost',
        description: formData.description || '',
        dueDate: formData.dueDate || new Date().toISOString(),
        completed: false,
        archived: false,
        createdAt: new Date().toISOString(),
      }
      setEntries([...entries, newEntry])
    }

    closeModals()
  }

  const editTask = (task) => {
    setEditingTask(task)
    setFormData({
      name: task.name,
      cost: task.cost,
      description: task.description,
      dueDate: task.dueDate,
      quadrant: task.quadrant,
    })
    setModals({ ...modals, task: true })
  }

  const saveTask = (e) => {
    e.preventDefault()

    if (editingTask) {
      setTasks(tasks.map(task =>
        task.id === editingTask.id
          ? {
              ...task,
              name: formData.name,
              cost: formData.cost,
              description: formData.description,
              dueDate: formData.dueDate,
            }
          : task
      ))
    } else {
      const newTask = {
        id: Date.now().toString(),
        ...formData,
        completed: false,
        createdAt: new Date().toISOString(),
      }
      setTasks([...tasks, newTask])
    }

    closeModals()
  }

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const toggleEntry = (entryId) => {
    setEntries(entries.map(entry =>
      entry.id === entryId
        ? {
            ...entry,
            completed: !entry.completed,
            archived: !entry.completed ? true : entry.archived,
            completedAt: !entry.completed ? new Date().toISOString() : null,
          }
        : entry
    ))
  }

  const unarchiveEntry = (entryId) => {
    setEntries(entries.map(entry =>
      entry.id === entryId
        ? {
            ...entry,
            archived: false,
            completed: false,
            completedAt: null,
          }
        : entry
    ))
  }

  const deleteEntry = (entryId) => {
    setEntries(entries.filter(entry => entry.id !== entryId))
  }

  const toggleUrgentEntry = (entryId) => {
    toggleEntry(entryId)
  }

  const openSubcategoryModal = () => {
    setEditingSubcategory(null)
    setFormData({})
    setModals({ ...modals, subcategory: true })
  }

  const editSubcategory = (subcategory) => {
    setEditingSubcategory(subcategory)
    setSelectedCategory(FIXED_CATEGORIES.find(cat => cat.id === subcategory.categoryId))
    setFormData({
      name: subcategory.name,
      description: subcategory.description,
      icon: subcategory.icon,
      color: subcategory.color,
      budget: subcategory.budget,
      deadline: subcategory.deadline,
      important: subcategory.important,
    })
    setModals({ ...modals, subcategory: true })
  }

  const deleteSubcategory = (subcategoryId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette sous-catégorie ? Toutes les entrées associées seront également supprimées.')) {
      setSubcategories(subcategories.filter(sub => sub.id !== subcategoryId))
      setEntries(entries.filter(entry => entry.subcategoryId !== subcategoryId))
    }
  }

  const saveSubcategory = (e) => {
    e.preventDefault()

    if (editingSubcategory) {
      setSubcategories(subcategories.map(sub =>
        sub.id === editingSubcategory.id
          ? {
              ...sub,
              name: formData.name,
              description: formData.description,
              icon: formData.icon,
              color: formData.color,
              budget: formData.budget,
              deadline: formData.deadline,
              important: formData.important,
            }
          : sub
      ))
    } else {
      const newSubcategory = {
        id: `sub-${Date.now()}`,
        categoryId: selectedCategory.id,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        budget: formData.budget,
        deadline: formData.deadline,
        important: formData.important,
      }
      setSubcategories([...subcategories, newSubcategory])
    }

    closeModals()
  }

  const getSubcategories = (categoryId) => {
    return subcategories.filter(sub => sub.categoryId === categoryId)
  }

  const getEntries = (subcategoryId) => {
    return entries.filter(entry => entry.subcategoryId === subcategoryId)
  }

  const getSubcategoryTotal = (subcategoryId, filter = periodFilter) => {
    const subEntries = filterEntriesByPeriod(getEntries(subcategoryId), filter)
    return subEntries.reduce((sum, entry) => {
      const amount = parseFloat(entry.cost) || 0
      // Les gains sont positifs, les coûts sont négatifs
      return sum + (entry.entryType === 'gain' ? amount : -amount)
    }, 0)
  }

  const getCategoryTotal = (categoryId, filter = periodFilter) => {
    const catSubcategories = getSubcategories(categoryId)
    return catSubcategories.reduce((sum, sub) => sum + getSubcategoryTotal(sub.id, filter), 0)
  }

  const getPeriodLabel = (filter = periodFilter) => {
    const { start, end } = getPeriodDates(filter)
    const options = { day: 'numeric', month: 'short', year: 'numeric' }

    switch (filter) {
      case 'day':
        return start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      case 'week':
        return `Semaine du ${start.toLocaleDateString('fr-FR', options)} au ${end.toLocaleDateString('fr-FR', options)}`
      case 'month':
        return `Du ${start.toLocaleDateString('fr-FR', options)} au ${end.toLocaleDateString('fr-FR', options)}`
      case 'year':
        return `Année ${start.getFullYear()}`
      default:
        return ''
    }
  }

  const getEntryInfo = (entryId) => {
    for (const cat of FIXED_CATEGORIES) {
      for (const sub of getSubcategories(cat.id)) {
        if (getEntries(sub.id).some(e => e.id === entryId)) {
          return { category: cat, subcategory: sub }
        }
      }
    }
    return null
  }

  // Composant: Graphique circulaire (Pie Chart)
  const PieChart = ({ data, colors, labels }) => {
    const total = data.reduce((sum, val) => sum + val, 0)
    let currentAngle = -90

    const slices = data.map((value, index) => {
      if (value === 0) return null
      const percentage = (value / total) * 100
      const angle = (value / total) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle

      const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
      const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
      const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
      const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)

      const largeArc = angle > 180 ? 1 : 0

      currentAngle += angle

      return (
        <g key={index}>
          <path
            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={colors[index]}
            stroke="#1e293b"
            strokeWidth="1"
          />
        </g>
      )
    })

    return (
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="w-32 h-32">
          {slices}
        </svg>
        <div className="space-y-1">
          {labels.map((label, index) => (
            data[index] > 0 && (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: colors[index] }}></div>
                <span className="text-white">{label}: {data[index].toFixed(0)}{currency.symbol}</span>
              </div>
            )
          ))}
        </div>
      </div>
    )
  }

  // Composant: Barre de progression horizontale
  const ProgressBar = ({ value, max, color, label }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm text-white mb-1">
          <span>{label}</span>
          <span>{value.toFixed(0)}{currency.symbol} / {max.toFixed(0)}{currency.symbol} ({percentage.toFixed(0)}%)</span>
        </div>
        <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      </div>
    )
  }

  // Composant: Graphique à barres pour les tâches
  const TaskBarChart = ({ tasks }) => {
    const completedCount = tasks.filter(t => t.completed).length
    const totalCount = tasks.length
    const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    return (
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="bg-gray-700 rounded-full h-8 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${percentage}%` }}
            >
              {percentage > 15 && <span className="text-white text-xs font-bold">{completedCount}/{totalCount}</span>}
            </div>
          </div>
        </div>
        <span className="text-white font-bold text-lg">{percentage.toFixed(0)}%</span>
      </div>
    )
  }

  const renderDashboard = () => {
    const { start, end } = getPeriodDates(dashboardFilter)
    const periodEntries = filterEntriesByPeriod(entries.filter(e => !e.archived), dashboardFilter)

    // Données financières par catégorie
    const financialData = FIXED_CATEGORIES.map(cat => getCategoryTotal(cat.id, dashboardFilter))
    const totalExpenses = financialData.reduce((sum, val) => sum + val, 0)

    // Tâches par quadrant
    const quadrantTasks = EISENHOWER_QUADRANTS.map(q => {
      const qt = tasks.filter(t => t.quadrant === q.id && !t.completed)
      return {
        name: q.name,
        count: qt.length,
        completed: tasks.filter(t => t.quadrant === q.id && t.completed).length,
        total: tasks.filter(t => t.quadrant === q.id).length,
        color: q.color
      }
    })

    // Entrées par sous-catégorie (top 5)
    const subcategoryStats = subcategories
      .map(sub => ({
        name: sub.name,
        icon: sub.icon,
        total: getSubcategoryTotal(sub.id, dashboardFilter),
        count: filterEntriesByPeriod(getEntries(sub.id), dashboardFilter).length,
        color: sub.color
      }))
      .filter(s => s.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => setView('main-matrix')} className="text-white mb-4 hover:underline flex items-center gap-2">
            ← Retour à la matrice principale
          </button>

          <header className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">📊 Bilan & Statistiques</h1>
            <p className="text-indigo-200">Vue d'ensemble de vos activités</p>
          </header>

          {/* Filtre de période */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { value: 'day', label: '📅 Jour' },
                { value: 'week', label: '📆 Semaine' },
                { value: 'month', label: '🗓️ Mois' },
                { value: 'year', label: '📊 Année' },
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setDashboardFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg transition ${
                    dashboardFilter === filter.value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <p className="text-white text-opacity-80 text-center mt-3 font-semibold">
              {getPeriodLabel(dashboardFilter)}
            </p>
          </div>

          {/* KPIs principaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-white text-opacity-70 text-sm">Dépenses totales</p>
              <p className="text-3xl font-bold text-yellow-300">{totalExpenses.toFixed(0)}{currency.symbol}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-white text-opacity-70 text-sm">Tâches actives</p>
              <p className="text-3xl font-bold text-red-300">{tasks.filter(t => !t.completed).length}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-white text-opacity-70 text-sm">Tâches terminées</p>
              <p className="text-3xl font-bold text-green-300">{tasks.filter(t => t.completed).length}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-white text-opacity-70 text-sm">Entrées archivées</p>
              <p className="text-3xl font-bold text-purple-300">{entries.filter(e => e.archived).length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graphique financier */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">💰 Répartition des dépenses</h2>
              {totalExpenses > 0 ? (
                <PieChart
                  data={financialData}
                  colors={FIXED_CATEGORIES.map(c => c.color)}
                  labels={FIXED_CATEGORIES.map(c => c.name)}
                />
              ) : (
                <p className="text-white text-opacity-50 text-center py-8">Aucune dépense pour cette période</p>
              )}
            </div>

            {/* Tâches par quadrant */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">✅ Tâches par quadrant</h2>
              <div className="space-y-4">
                {quadrantTasks.map((qt, index) => (
                  <div key={index} className="bg-black bg-opacity-20 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">{qt.name}</span>
                      <span className="text-white text-opacity-70 text-sm">{qt.completed}/{qt.total} terminées</span>
                    </div>
                    <TaskBarChart tasks={tasks.filter(t => t.quadrant === qt.id)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 sous-catégories */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🏆 Top 5 sous-catégories</h2>
              {subcategoryStats.length > 0 ? (
                <div className="space-y-3">
                  {subcategoryStats.map((stat, index) => (
                    <div key={index} className="bg-black bg-opacity-20 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{stat.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-white font-semibold">{stat.name}</span>
                            <span className="text-yellow-300 font-bold">{stat.total.toFixed(0)}{currency.symbol}</span>
                          </div>
                          <div className="bg-gray-700 rounded-full h-2 mt-1">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(stat.total / subcategoryStats[0].total) * 100}%`,
                                backgroundColor: stat.color
                              }}
                            />
                          </div>
                          <p className="text-white text-opacity-50 text-xs mt-1">{stat.count} entrée(s)</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white text-opacity-50 text-center py-8">Aucune entrée pour cette période</p>
              )}
            </div>

            {/* Budget par catégorie */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">📋 Budget par catégorie</h2>
              <div className="space-y-3">
                {FIXED_CATEGORIES.map(cat => {
                  const catSubs = getSubcategories(cat.id)
                  const totalBudget = catSubs.reduce((sum, sub) => sum + (parseFloat(sub.budget) || 0), 0)
                  const catTotal = getCategoryTotal(cat.id, dashboardFilter)

                  if (totalBudget === 0) return null

                  return (
                    <ProgressBar
                      key={cat.id}
                      value={catTotal}
                      max={totalBudget}
                      color={cat.color}
                      label={`${cat.icon} ${cat.name}`}
                    />
                  )
                })}
                {FIXED_CATEGORIES.every(cat => {
                  const catSubs = getSubcategories(cat.id)
                  return catSubs.reduce((sum, sub) => sum + (parseFloat(sub.budget) || 0), 0) === 0
                }) && (
                  <p className="text-white text-opacity-50 text-center py-8">Aucun budget défini</p>
                )}
              </div>
            </div>
          </div>

          {/* Taux de complétion global */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 mt-6">
            <h2 className="text-2xl font-bold text-white mb-4">📈 Taux de complétion global</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black bg-opacity-20 rounded-lg p-4 text-center">
                <p className="text-white text-opacity-70 mb-2">Tâches Eisenhower</p>
                <TaskBarChart tasks={tasks} />
              </div>
              <div className="bg-black bg-opacity-20 rounded-lg p-4 text-center">
                <p className="text-white text-opacity-70 mb-2">Entrées budgétaires</p>
                <TaskBarChart tasks={entries.filter(e => !e.archived).map(e => ({ ...e, completed: e.completed || e.archived }))} />
              </div>
              <div className="bg-black bg-opacity-20 rounded-lg p-4 text-center">
                <p className="text-white text-opacity-70 mb-2">Progression totale</p>
                <TaskBarChart tasks={[...tasks, ...entries.filter(e => !e.archived).map(e => ({ ...e, completed: e.completed || e.archived }))]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMainMatrix = () => {
    const urgentEntries = getUrgentEntries()

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <header className="text-center flex-1">
              <div className="flex items-center justify-center gap-4 mb-2">
                <img src="/logo-gosen.png" alt="Gosen Success" className="h-12 md:h-16" />
                <h1 className="text-4xl md:text-5xl font-bold text-white">Gosen Success</h1>
              </div>
              <p className="text-purple-200">Gérez vos priorités efficacement</p>
            </header>
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                📋 Menu
                <svg className="w-4 h-4 transition-transform" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50">
                  {licenseInfo && (
                    <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">💳 Paiement confirmé</p>
                      <p className="text-sm font-semibold text-gray-800">Numéro: {licenseInfo.phone}</p>
                      <p className="text-xs text-green-600">✓ {licenseInfo.type} - Actif</p>
                    </div>
                  )}
                  <button onClick={() => { setView('dashboard'); setMenuOpen(false); }}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    📊 Bilan
                  </button>
                  <button onClick={() => { setModals({ ...modals, settings: true }); setMenuOpen(false); }}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    ⚙️ Paramètres
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EISENHOWER_QUADRANTS.map(quadrant => {
              const quadrantTasks = tasks.filter(task => task.quadrant === quadrant.id && !task.completed)

              if (quadrant.id === 1) {
                return (
                  <div key={quadrant.id}
                       className={`${quadrant.bgColor} bg-opacity-20 border-2 border-opacity-30 rounded-2xl p-6 backdrop-blur-sm`}
                       style={{ borderColor: quadrant.color }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">{quadrant.name}</h2>
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-white text-sm">
                        {quadrantTasks.length + urgentEntries.length}
                      </span>
                    </div>
                    <p className="text-white text-opacity-80 mb-4 text-sm">{quadrant.description}</p>

                    {urgentEntries.length > 0 && (
                      <div className="bg-red-500 bg-opacity-30 border border-red-400 rounded-lg p-3 mb-4">
                        <p className="text-white font-bold mb-2">⚠️ Entrées urgentes détectées!</p>
                        <p className="text-white text-opacity-80 text-sm">Ces entrées ont une date d'échéance dans moins de {urgencyHours} heures:</p>
                      </div>
                    )}

                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                      {urgentEntries.map(entry => {
                        const info = getEntryInfo(entry.id)
                        const timeLeft = Math.floor((new Date(entry.dueDate) - new Date()) / (1000 * 60 * 60))
                        return (
                          <div key={entry.id} className="bg-red-500 bg-opacity-30 border border-red-400 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <button onClick={() => toggleUrgentEntry(entry.id)}
                                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${entry.completed ? 'bg-white' : 'border-white'}`}>
                                {entry.completed && <span className="text-green-600">✓</span>}
                              </button>
                              <div className="flex-1">
                                <p className={`text-white font-bold ${entry.completed ? 'line-through opacity-60' : ''}`}>{entry.name}</p>
                                {entry.cost && parseFloat(entry.cost) > 0 && (
                                  <p className={`text-sm ${entry.entryType === 'gain' ? 'text-green-400' : 'text-yellow-300'}`}>
                                    {entry.entryType === 'gain' ? '💰' : '💸'} {entry.cost}{currency.symbol}
                                  </p>
                                )}
                                <p className="text-red-200 text-xs">📅 {new Date(entry.dueDate).toLocaleString('fr-FR')}</p>
                                <p className="text-red-300 text-xs font-semibold">⏰ Plus que {timeLeft}h!</p>
                                {info && (
                                  <p className="text-white text-opacity-60 text-xs mt-1">
                                    📁 {info.category.icon} {info.category.name} → {info.subcategory.name}
                                  </p>
                                )}
                                <button onClick={() => { setSelectedSubcategory(info.subcategory); setSelectedCategory(info.category); setView('subcategory-detail'); }}
                                        className="text-blue-300 text-xs hover:underline mt-1">
                                  Voir détails →
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {quadrantTasks.map(task => (
                        <div key={task.id} className="bg-white bg-opacity-10 rounded-lg p-3 flex items-start gap-2">
                          <button onClick={() => toggleTask(task.id)}
                                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${task.completed ? 'bg-white' : 'border-white'}`}>
                            {task.completed && <span className="text-green-600">✓</span>}
                          </button>
                          <div className="flex-1">
                            <p className={`text-white ${task.completed ? 'line-through opacity-60' : ''}`}>{task.name}</p>
                            {task.cost && <p className="text-yellow-300 text-sm">💰 {task.cost}{currency.symbol}</p>}
                            {task.dueDate && <p className="text-purple-200 text-xs">📅 {new Date(task.dueDate).toLocaleDateString('fr-FR')}</p>}
                          </div>
                          <button onClick={() => editTask(task)} className="text-blue-300 hover:text-blue-100 mr-1">✏️</button>
                          <button onClick={() => deleteTask(task.id)} className="text-red-300 hover:text-red-100">🗑️</button>
                        </div>
                      ))}

                      {quadrantTasks.length === 0 && urgentEntries.length === 0 && (
                        <p className="text-white text-opacity-50 text-sm italic">Aucune tâche urgente</p>
                      )}
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); setEditingTask(null); setFormData({ quadrant: quadrant.id }); setModals({ ...modals, task: true }); }}
                            className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 rounded-lg transition">
                      + Ajouter une tâche
                    </button>
                  </div>
                )
              }

              if (quadrant.hasMatrix) {
                return (
                  <div key={quadrant.id}
                       onClick={() => setView('category-matrix')}
                       className={`${quadrant.bgColor} bg-opacity-20 border-2 border-opacity-30 rounded-2xl p-6 backdrop-blur-sm cursor-pointer transform hover:scale-105 transition`}
                       style={{ borderColor: quadrant.color }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">{quadrant.name}</h2>
                      <span className="text-3xl">📊</span>
                    </div>
                    <p className="text-white text-opacity-80 mb-4">{quadrant.description}</p>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <p className="text-white font-bold mb-2">📁 Budget & Planification</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {FIXED_CATEGORIES.map(cat => {
                          const catTotal = getCategoryTotal(cat.id)
                          return (
                            <div key={cat.id} className="bg-black bg-opacity-20 rounded p-2">
                              <span>{cat.icon}</span>
                              <span className="ml-1">{cat.name}</span>
                              {catTotal > 0 && <p className="text-yellow-300 text-xs">{catTotal.toFixed(0)}{currency.symbol}</p>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <p className="text-white text-opacity-60 text-sm mt-4 text-center">👆 Cliquez pour gérer le budget</p>
                  </div>
                )
              }

              return (
                <div key={quadrant.id}
                     className={`${quadrant.bgColor} bg-opacity-20 border-2 border-opacity-30 rounded-2xl p-6 backdrop-blur-sm`}
                     style={{ borderColor: quadrant.color }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{quadrant.name}</h2>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-white text-sm">
                      {quadrantTasks.length}
                    </span>
                  </div>
                  <p className="text-white text-opacity-80 mb-4 text-sm">{quadrant.description}</p>

                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {quadrantTasks.map(task => (
                      <div key={task.id} className="bg-white bg-opacity-10 rounded-lg p-3 flex items-start gap-2">
                        <button onClick={() => toggleTask(task.id)}
                                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${task.completed ? 'bg-white' : 'border-white'}`}>
                          {task.completed && <span className="text-green-600">✓</span>}
                        </button>
                        <div className="flex-1">
                          <p className={`text-white ${task.completed ? 'line-through opacity-60' : ''}`}>{task.name}</p>
                          {task.cost && <p className="text-yellow-300 text-sm">💰 {task.cost}{currency.symbol}</p>}
                          {task.dueDate && <p className="text-purple-200 text-xs">📅 {new Date(task.dueDate).toLocaleDateString('fr-FR')}</p>}
                        </div>
                        <button onClick={() => editTask(task)} className="text-blue-300 hover:text-blue-100 mr-1">✏️</button>
                        <button onClick={() => deleteTask(task.id)} className="text-red-300 hover:text-red-100">🗑️</button>
                      </div>
                    ))}
                    {quadrantTasks.length === 0 && (
                      <p className="text-white text-opacity-50 text-sm italic">Aucune tâche</p>
                    )}
                  </div>

                  <button onClick={(e) => { e.stopPropagation(); setEditingTask(null); setFormData({ quadrant: quadrant.id }); setModals({ ...modals, task: true }); }}
                          className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 rounded-lg transition">
                    + Ajouter une tâche
                  </button>
                </div>
              )
            })}
          </div>

          {/* Section Partenaires */}
          <div className="mt-8 bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-10">
            <h2 className="text-2xl font-bold text-white text-center mb-6">🤝 Nos Partenaires</h2>
            <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap">
              <a href="https://filtreexpert.org" target="_blank" rel="noopener noreferrer"
                 className="group transition-all duration-300 hover:scale-110">
                <img src="/logo.png" alt="Filtre Expert" className="h-16 md:h-20 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
              <a href="https://wa.me/241077045354" target="_blank" rel="noopener noreferrer"
                 className="group transition-all duration-300 hover:scale-110">
                <img src="/partner-gm.webp" alt="Contact WhatsApp" className="h-16 md:h-20 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <p className="text-white text-opacity-50 text-xs text-center mt-4">
              Découvrez nos solutions complémentaires
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderCategoryMatrix = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => setView('main-matrix')} className="text-white mb-4 hover:underline flex items-center gap-2">
          ← Retour à la matrice principale
        </button>

        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">📊 Budget & Planification</h1>
          <p className="text-green-200">Important Non-Urgent - Gérez vos finances</p>
        </header>

        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { value: 'day', label: '📅 Jour' },
              { value: 'week', label: '📆 Semaine' },
              { value: 'month', label: '🗓️ Mois' },
              { value: 'year', label: '📊 Année' },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setPeriodFilter(filter.value)}
                className={`px-4 py-2 rounded-lg transition ${
                  periodFilter === filter.value
                    ? 'bg-green-500 text-white'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <p className="text-white text-opacity-80 text-center mt-3 font-semibold">
            {getPeriodLabel()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FIXED_CATEGORIES.map(category => {
            const catSubcategories = getSubcategories(category.id)
            const catTotal = getCategoryTotal(category.id)

            return (
              <div key={category.id}
                   className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border-2 border-opacity-30"
                   style={{ borderColor: category.color }}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{category.icon}</span>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                    <p className="text-white text-opacity-70 text-sm">{category.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-300 text-2xl font-bold">{catTotal.toFixed(0)}{currency.symbol}</p>
                    <p className="text-white text-opacity-60 text-sm">{catSubcategories.length} sous-catégories</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {catSubcategories.map(sub => {
                    const subTotal = getSubcategoryTotal(sub.id)
                    return (
                      <div key={sub.id}
                           className="bg-black bg-opacity-20 rounded-lg p-3 flex items-center gap-2 group"
                           style={{ borderLeft: `4px solid ${sub.color || category.color}` }}>
                        <div
                          onClick={() => { setSelectedSubcategory(sub); setSelectedCategory(category); setView('subcategory-detail'); setShowArchived(false); }}
                          className="flex-1 flex items-center gap-2 cursor-pointer hover:bg-opacity-30 transition">
                          <span className="text-xl">{sub.icon || '📁'}</span>
                          <div className="flex-1">
                            <p className="text-white font-semibold">{sub.name}</p>
                            {sub.description && <p className="text-white text-opacity-60 text-xs">{sub.description}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-300 font-bold">{subTotal.toFixed(0)}{currency.symbol}</p>
                            <p className="text-white text-opacity-60 text-xs">{filterEntriesByPeriod(getEntries(sub.id)).filter(e => !e.archived).length} entrées</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={(e) => { e.stopPropagation(); editSubcategory(sub); }}
                                  className="text-blue-300 hover:text-blue-100 p-1" title="Modifier">
                            ✏️
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteSubcategory(sub.id); }}
                                  className="text-red-300 hover:text-red-100 p-1" title="Supprimer">
                            🗑️
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  {catSubcategories.length === 0 && (
                    <p className="text-white text-opacity-50 text-sm italic text-center py-4">
                      Aucune sous-catégorie. Cliquez sur "+" pour en ajouter.
                    </p>
                  )}
                </div>

                <button onClick={() => { setSelectedCategory(category); openSubcategoryModal(); }}
                        className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 rounded-lg transition">
                  + Ajouter une sous-catégorie
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderSubcategoryDetail = () => {
    const allEntries = getEntries(selectedSubcategory.id)
    const activeEntries = allEntries.filter(e => !e.archived)
    const archivedEntries = allEntries.filter(e => e.archived)
    const displayEntries = showArchived ? archivedEntries : activeEntries
    const filteredEntries = filterEntriesByPeriod(displayEntries)
    const total = filteredEntries.reduce((sum, entry) => {
      const amount = parseFloat(entry.cost) || 0
      return sum + (entry.entryType === 'gain' ? amount : -amount)
    }, 0)

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setView('category-matrix')} className="text-white mb-4 hover:underline flex items-center gap-2">
            ← Retour aux catégories
          </button>

          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { value: 'day', label: '📅 Jour' },
                { value: 'week', label: '📆 Semaine' },
                { value: 'month', label: '🗓️ Mois' },
                { value: 'year', label: '📊 Année' },
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setPeriodFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg transition ${
                    periodFilter === filter.value
                      ? 'bg-green-500 text-white'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <p className="text-white text-opacity-80 text-center mt-3 font-semibold">
              {getPeriodLabel()}
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{selectedSubcategory.icon || '📁'}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-white">{selectedSubcategory.name}</h1>
                  {selectedSubcategory.important && <span className="text-yellow-400 text-2xl">⭐</span>}
                </div>
                <p className="text-purple-200">{selectedSubcategory.description}</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-300 text-3xl font-bold">{total.toFixed(0)}{currency.symbol}</p>
                <p className="text-white text-opacity-60">{filteredEntries.length} entrées</p>
              </div>
            </div>

            {selectedSubcategory.budget && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-white mb-1">
                  <span>Budget: {total.toFixed(0)}{currency.symbol} / {selectedSubcategory.budget}{currency.symbol}</span>
                  <span>{((total / selectedSubcategory.budget) * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full h-3">
                  <div className="bg-green-400 h-3 rounded-full transition-all"
                       style={{ width: `${Math.min((total / selectedSubcategory.budget) * 100, 100)}%` }}></div>
                </div>
              </div>
            )}

            {selectedSubcategory.deadline && (
              <p className="text-red-300">📅 Date limite: {new Date(selectedSubcategory.deadline).toLocaleDateString('fr-FR')}</p>
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white">
                {showArchived ? '📦 Archives' : 'Entrées'}
              </h2>
              {(activeEntries.length > 0 || archivedEntries.length > 0) && (
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    showArchived
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  {showArchived
                    ? `📋 Voir actives (${activeEntries.length})`
                    : `📦 Voir archives (${archivedEntries.length})`}
                </button>
              )}
            </div>
            {!showArchived && (
              <button onClick={openEntryModal}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                + Nouvelle entrée
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredEntries.map(entry => (
              <div key={entry.id} className={`bg-white bg-opacity-10 rounded-xl p-4 ${entry.archived ? 'border border-gray-500' : ''}`}>
                <div className="flex items-start gap-3">
                  {!showArchived && (
                    <button onClick={() => toggleEntry(entry.id)}
                            className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${entry.completed ? 'bg-green-500 border-green-500' : 'border-white'}`}>
                      {entry.completed && <span className="text-white">✓</span>}
                    </button>
                  )}
                  {showArchived && (
                    <button onClick={() => unarchiveEntry(entry.id)}
                            className="mt-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded flex-shrink-0"
                            title="Restaurer">
                      🔄
                    </button>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-white font-bold ${entry.archived ? 'opacity-70' : ''}`}>
                          {entry.name}
                          {entry.archived && <span className="ml-2 text-xs bg-gray-500 px-2 py-1 rounded">Archivé</span>}
                        </h3>
                        {entry.description && <p className="text-purple-200 text-sm">{entry.description}</p>}
                        {entry.completedAt && (
                          <p className="text-gray-400 text-xs">✓ Terminé le {new Date(entry.completedAt).toLocaleDateString('fr-FR')}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {entry.cost && parseFloat(entry.cost) > 0 && (
                          <p className={`font-bold text-xl ${entry.entryType === 'gain' ? 'text-green-400' : 'text-yellow-300'}`}>
                            {entry.entryType === 'gain' ? '💰' : '💸'} {entry.cost}{currency.symbol}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-purple-200 text-sm">
                        📅 {new Date(entry.dueDate).toLocaleDateString('fr-FR')} à {new Date(entry.dueDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => editEntry(entry)} className="text-blue-300 hover:text-blue-100">✏️ Modifier</button>
                        <button onClick={() => deleteEntry(entry.id)} className="text-red-300 hover:text-red-100">🗑️ Supprimer</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredEntries.length === 0 && (
              <p className="text-white text-opacity-50 text-center italic py-8">
                {showArchived
                  ? 'Aucune entrée archivée.'
                  : 'Aucune entrée pour cette période. Cliquez sur "+ Nouvelle entrée" pour commencer.'}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Exporter les données
  const exportData = () => {
    const data = {
      subcategories,
      entries,
      tasks,
      urgencyHours,
      monthStartDay,
      currency,
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gosen-success-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    alert(`✅ Données exportées !\n${entries.length} entrées, ${tasks.length} tâches`)
  }

  // Importer les données
  const importData = (event) => {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.subcategories) setSubcategories(data.subcategories)
        if (data.entries) setEntries(data.entries)
        if (data.tasks) setTasks(data.tasks)
        if (data.urgencyHours) setUrgencyHours(parseInt(data.urgencyHours))
        if (data.monthStartDay) setMonthStartDay(parseInt(data.monthStartDay))
        if (data.currency) setCurrency(data.currency)
        alert(`✅ Données importées avec succès !\n${data.entries?.length || 0} entrées, ${data.tasks?.length || 0} tâches`)
      } catch (error) {
        alert("❌ Erreur lors de l'import : " + error.message)
      }
    }
    reader.readAsText(file)
  }

  const renderSettingsModal = () => (
    modals.settings && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-4">⚙️ Paramètres</h2>
          <div className="overflow-y-auto overflow-x-auto flex-1 pr-2">
            <div className="space-y-6 min-w-full">
            <div>
              <label className="text-white block mb-2">⏰ Heures pour urgence automatique</label>
              <p className="text-white text-opacity-60 text-sm mb-3">
                Les entrées avec une date d'échéance dans moins de ce nombre d'heures apparaissent automatiquement dans "Important & Urgent".
              </p>
              <input
                type="number"
                min="1"
                max="168"
                value={urgencyHours}
                onChange={(e) => setUrgencyHours(parseInt(e.target.value) || 24)}
                className="w-full bg-slate-700 text-white rounded-lg p-3 text-xl text-center"
              />
              <p className="text-white text-opacity-60 text-sm mt-2">
                Actuel: moins de {urgencyHours}h avant échéance = Urgent
              </p>
            </div>

            <div>
              <label className="text-white block mb-2">🗓️ Jour de début du mois</label>
              <p className="text-white text-opacity-60 text-sm mb-3">
                Par exemple, si vous choisissez le 25, le mois ira du 25 janvier au 24 février.
              </p>
              <input
                type="number"
                min="1"
                max="31"
                value={monthStartDay}
                onChange={(e) => setMonthStartDay(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-700 text-white rounded-lg p-3 text-xl text-center"
              />
              <p className="text-white text-opacity-60 text-sm mt-2">
                Actuel: du {monthStartDay} au {monthStartDay - 1 || 31} du mois suivant
              </p>
            </div>

            <div>
              <label className="text-white block mb-2">💱 Devise</label>
              <p className="text-white text-opacity-60 text-sm mb-3">
                Choisissez la devise utilisée pour vos montants.
              </p>
              <select
                value={currency.code}
                onChange={(e) => {
                  const selected = CURRENCIES.find(c => c.code === e.target.value)
                  setCurrency(selected)
                }}
                className="w-full bg-slate-700 text-white rounded-lg p-3 text-lg"
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>{curr.name}</option>
                ))}
              </select>
              <p className="text-white text-opacity-60 text-sm mt-2 text-center">
                Symbole actuel : <span className="font-bold text-yellow-300">{currency.symbol}</span>
              </p>
            </div>

            <div className="bg-purple-500 bg-opacity-20 border border-purple-400 rounded-lg p-4">
              <p className="text-purple-300 font-bold mb-3">💾 Sauvegarde & Restauration</p>
              <button onClick={exportData} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg mb-2">
                📤 Exporter les données (JSON)
              </button>
              <label className="block">
                <span className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-center cursor-pointer block">
                  📥 Importer les données (JSON)
                </span>
                <input type="file" accept="application/json" onChange={importData} className="hidden" />
              </label>
              <p className="text-white text-opacity-60 text-xs mt-2">
                Sauvegardez régulièrement vos données sur Google Drive
              </p>
            </div>

            <div className="bg-yellow-500 bg-opacity-20 border border-yellow-400 rounded-lg p-4">
              <p className="text-yellow-300 font-bold mb-3">⏰ Rappels de sauvegarde</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white">Activer les rappels</span>
                <button
                  onClick={() => {
                    if (!backupReminderEnabled) {
                      // Demander la permission notification
                      if ('Notification' in window && Notification.permission === 'default') {
                        Notification.requestPermission().then(permission => {
                          setNotificationPermission(permission)
                          if (permission === 'granted') {
                            setBackupReminderEnabled(true)
                          } else {
                            alert('Les notifications sont nécessaires pour les rappels.')
                          }
                        })
                      } else if ('Notification' in window && Notification.permission === 'granted') {
                        setBackupReminderEnabled(true)
                      } else {
                        alert('Les notifications ne sont pas supportées ou sont bloquées.')
                      }
                    } else {
                      setBackupReminderEnabled(false)
                    }
                  }}
                  className={`w-14 h-7 rounded-full p-1 transition-colors ${
                    backupReminderEnabled ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    backupReminderEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              {backupReminderEnabled && (
                <div>
                  <label className="text-white block mb-2">Fréquence du rappel</label>
                  <select
                    value={backupReminderFrequency}
                    onChange={(e) => setBackupReminderFrequency(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded-lg p-2"
                  >
                    <option value="day">📅 Quotidien (tous les jours à 9h)</option>
                    <option value="week">📆 Hebdomadaire (chaque lundi à 9h)</option>
                    <option value="month">🗓️ Mensuel (le 1er de chaque mois à 9h)</option>
                    <option value="quarter">📊 Trimestriel (tous les 3 mois)</option>
                  </select>
                </div>
              )}
              <p className="text-white text-opacity-60 text-xs mt-2">
                {notificationPermission === 'granted'
                  ? '✅ Notifications activées'
                  : notificationPermission === 'denied'
                  ? '❌ Notifications bloquées dans le navigateur'
                  : 'ℹ️ Les notifications seront demandées à l\'activation'}
              </p>
            </div>

            <div className="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-4">
              <p className="text-blue-300 font-bold mb-2">ℹ️ Info</p>
              <p className="text-white text-opacity-80 text-sm">
                Les paramètres sont sauvegardés automatiquement et restent disponibles à chaque visite.
              </p>
            </div>
          </div>
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
            <button onClick={() => setModals({ ...modals, settings: false })}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">
              Fermer
            </button>
          </div>
        </div>
      </div>
    )
  )

  const renderSubcategoryModal = () => (
    modals.subcategory && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">
            {editingSubcategory ? '✏️ Modifier Sous-catégorie' : 'Nouvelle Sous-catégorie'}
          </h2>
          <p className="text-purple-200 mb-4 text-sm">Pour: {selectedCategory?.name}</p>
          <form onSubmit={saveSubcategory} className="space-y-4">
            <div>
              <label className="text-white block mb-1">Nom *</label>
              <input type="text" required
                     value={formData.name || ''}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     className="w-full bg-slate-700 text-white rounded-lg p-2" />
            </div>
            <div>
              <label className="text-white block mb-1">Description</label>
              <textarea value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-700 text-white rounded-lg p-2" rows="2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white block mb-1">Icône (emoji)</label>
                <input type="text"
                       value={formData.icon || ''}
                       onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                       className="w-full bg-slate-700 text-white rounded-lg p-2"
                       placeholder="📁" maxLength={2} />
              </div>
              <div>
                <label className="text-white block mb-1">Couleur</label>
                <input type="color" value={formData.color || selectedCategory?.color || '#3b82f6'}
                       onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                       className="w-full h-10 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="text-white block mb-1">Budget cible ({currency.symbol})</label>
              <input type="number" step="0.01"
                     value={formData.budget || ''}
                     onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                     className="w-full bg-slate-700 text-white rounded-lg p-2" />
            </div>
            <div>
              <label className="text-white block mb-1">Date limite</label>
              <input type="date"
                     value={formData.deadline || ''}
                     onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                     className="w-full bg-slate-700 text-white rounded-lg p-2" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="important"
                     checked={formData.important || false}
                     onChange={(e) => setFormData({ ...formData, important: e.target.checked })}
                     className="w-5 h-5" />
              <label htmlFor="important" className="text-white">⭐ Important</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">
                {editingSubcategory ? '💾 Enregistrer' : 'Créer'}
              </button>
              <button type="button" onClick={closeModals}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  )

  const renderEntryModal = () => (
    modals.entry && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">
            {editingEntry ? '✏️ Modifier Entrée' : 'Nouvelle Entrée'}
          </h2>
          <p className="text-purple-200 mb-4 text-sm">Pour: {selectedSubcategory?.name}</p>
          <form onSubmit={saveEntry} className="space-y-4">
            <div>
              <label className="text-white block mb-1">Nom *</label>
              <input type="text" required
                     value={formData.name || ''}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     className="w-full bg-slate-700 text-white rounded-lg p-2" />
            </div>
            <div>
              <label className="text-white block mb-1">Type</label>
              <select
                value={formData.entryType || 'cost'}
                onChange={(e) => setFormData({ ...formData, entryType: e.target.value })}
                className="w-full bg-slate-700 text-white rounded-lg p-2"
              >
                <option value="cost">💸 Coût (dépense)</option>
                <option value="gain">💰 Gain (revenu)</option>
              </select>
            </div>
            <div>
              <label className="text-white block mb-1">
                {formData.entryType === 'gain' ? `Montant (${currency.symbol}) - optionnel` : `Coût (${currency.symbol}) - optionnel`}
              </label>
              <input type="number" step="0.01"
                     value={formData.cost || ''}
                     onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                     className="w-full bg-slate-700 text-white rounded-lg p-2"
                     placeholder="0.00" />
            </div>
            <div>
              <label className="text-white block mb-1">Date et heure (optionnel)</label>
              <input type="datetime-local"
                     value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''}
                     onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                     className="w-full bg-slate-700 text-white rounded-lg p-2" />
              <p className="text-white text-opacity-50 text-xs mt-1">Par défaut: date et heure actuelles</p>
            </div>
            <div>
              <label className="text-white block mb-1">Description</label>
              <textarea value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-700 text-white rounded-lg p-2" rows="2" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">
                {editingEntry ? '💾 Enregistrer' : 'Ajouter'}
              </button>
              <button type="button" onClick={closeModals}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  )

  const renderTaskModal = () => (
    modals.task && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">
            {editingTask ? '✏️ Modifier Tâche' : 'Nouvelle Tâche'}
          </h2>
          <form onSubmit={saveTask} className="space-y-4">
            <div>
              <label className="text-white block mb-1">Nom de la tâche *</label>
              <input type="text" required
                     value={formData.name || ''}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     className="w-full bg-slate-700 text-white rounded-lg p-2" />
            </div>
            <div>
              <label className="text-white block mb-1">Coût estimé ({currency.symbol}) - optionnel</label>
              <input type="number" step="0.01"
                     value={formData.cost || ''}
                     onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                     className="w-full bg-slate-700 text-white rounded-lg p-2" />
            </div>
            <div>
              <label className="text-white block mb-1">Date d'échéance (optionnel)</label>
              <input type="date"
                     value={formData.dueDate || ''}
                     onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                     className="w-full bg-slate-700 text-white rounded-lg p-2" />
            </div>
            <div>
              <label className="text-white block mb-1">Description</label>
              <textarea value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-700 text-white rounded-lg p-2" rows="2" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">
                {editingTask ? '💾 Enregistrer' : 'Ajouter'}
              </button>
              <button type="button" onClick={closeModals}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  )

  return (
    <div>
      {view === 'main-matrix' && renderMainMatrix()}
      {view === 'category-matrix' && renderCategoryMatrix()}
      {view === 'subcategory-detail' && renderSubcategoryDetail()}
      {view === 'dashboard' && renderDashboard()}
      {renderSettingsModal()}
      {renderSubcategoryModal()}
      {renderEntryModal()}
      {renderTaskModal()}
    </div>
  )
}
