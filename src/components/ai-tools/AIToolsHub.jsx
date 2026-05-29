import { useState } from 'react'
import { Plus, ChevronDown, Trash2, ArrowLeft, Target, Cpu, Map, Layout, TrendingUp, CheckCircle, Circle, Loader2 } from 'lucide-react'
import { useProjects } from '../../hooks/useProjects'
import { supabase } from '../../lib/supabaseClient'
import NicheValidator from './NicheValidator'
import MVPGenerator from './MVPGenerator'
import RoadmapCreator from './RoadmapCreator'
import LandingPageAI from './LandingPageAI'
import MonetizationDiag from './MonetizationDiag'

const TOOLS = [
  {
    id: 0, key: 'niche_data',
    label: 'Validador de Nicho',
    desc: 'Analise seu nicho com IA e descubra o potencial de monetização antes de construir.',
    icon: Target, color: 'bg-[#E8F5EE] dark:bg-[#0F4A28]/20', iconColor: 'text-[#1B6B3A] dark:text-green-400',
  },
  {
    id: 1, key: 'mvp_data',
    label: 'Gerador de MVP',
    desc: 'Defina as funcionalidades essenciais e gere prompts prontos para o Cursor/Lovable/Bolt.',
    icon: Cpu, color: 'bg-blue-50 dark:bg-blue-900/10', iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 2, key: 'roadmap_data',
    label: 'Criador de Roadmap',
    desc: 'Crie um roadmap realista baseado no seu perfil e tempo disponível.',
    icon: Map, color: 'bg-purple-50 dark:bg-purple-900/10', iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 3, key: 'landing_data',
    label: 'IA para Landing Pages',
    desc: 'Gere copy de alta conversão, hero section, FAQ e prompts para construir sua página.',
    icon: Layout, color: 'bg-yellow-50 dark:bg-yellow-900/10', iconColor: 'text-[#C9A84C]',
  },
  {
    id: 4, key: 'monetization_data',
    label: 'Diagnóstico de Monetização',
    desc: 'Identifique gargalos, gere um plano de 30 dias e defina a estratégia ideal de escala.',
    icon: TrendingUp, color: 'bg-red-50 dark:bg-red-900/10', iconColor: 'text-[#B80E02]',
  },
]

export default function AIToolsHub({ userId }) {
  const { projects, activeProject, setActiveProject, loading, createProject, saveToolData, deleteProject } = useProjects(userId)
  const [activeTool, setActiveTool] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    await createProject(newName.trim())
    setNewName('')
    setCreating(false)
    setShowDropdown(false)
  }

  const handleSaveToolData = async (field, value) => {
    if (!activeProject) return
    await saveToolData(activeProject.id, field, value)
  }

  const handleNext = (currentIdx) => {
    if (currentIdx < 4) setActiveTool(currentIdx + 1)
    else setActiveTool(null)
  }

  const getStatus = (tool) => {
    if (!activeProject) return 'empty'
    return activeProject[tool.key] ? 'done' : 'empty'
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-[#1B6B3A]" />
    </div>
  )

  // Renderiza ferramenta ativa
  if (activeTool !== null) {
    const tool = TOOLS[activeTool]
    const Icon = tool.icon
    const toolProps = {
      project: activeProject,
      onSave: handleSaveToolData,
      onNext: () => handleNext(activeTool),
    }
    const components = [NicheValidator, MVPGenerator, RoadmapCreator, LandingPageAI, MonetizationDiag]
    const ToolComponent = components[activeTool]

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTool(null)}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400 transition-colors">
            <ArrowLeft size={14} /> Ferramentas IA
          </button>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tool.color}`}>
              <Icon size={14} className={tool.iconColor} />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{tool.label}</span>
          </div>
          {activeProject && (
            <span className="ml-auto text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {activeProject.name}
            </span>
          )}
        </div>

        {!activeProject && (
          <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-xl text-xs text-yellow-700 dark:text-yellow-400">
            ⚠️ Crie ou selecione um projeto para salvar os resultados.
          </div>
        )}

        <ToolComponent {...toolProps} />
      </div>
    )
  }

  // Hub principal
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-1">Jornada SaaS</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">5 passos que conversam entre si para validar, construir e escalar seu SaaS.</p>
      </div>

      {/* Project selector */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 relative">
            <button
              onClick={() => setShowDropdown(d => !d)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-xs hover:border-[#1B6B3A] transition-colors bg-gray-50 dark:bg-[#111]"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                {activeProject ? activeProject.name : 'Selecionar projeto'}
              </span>
              <ChevronDown size={13} className="shrink-0 text-gray-400" />
            </button>
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                {projects.map(p => (
                  <button key={p.id} onClick={() => { setActiveProject(p); setShowDropdown(false) }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${activeProject?.id === p.id ? 'text-[#1B6B3A] font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                    {p.name}
                    {activeProject?.id === p.id && <CheckCircle size={11} className="inline ml-2 text-[#1B6B3A]" />}
                  </button>
                ))}
                {projects.length === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-400">Nenhum projeto ainda</p>
                )}
                <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                  <div className="flex items-center gap-2">
                    <input value={newName} onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreate()}
                      placeholder="Nome do novo projeto..." autoFocus
                      className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 placeholder-gray-400" />
                    <button onClick={handleCreate} disabled={!newName.trim() || creating}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#0F4A28] hover:bg-[#1B6B3A] text-white rounded-lg transition-colors disabled:opacity-50 shrink-0">
                      {creating ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                      Criar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {activeProject && (
            <div className="flex items-center gap-2">
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#B80E02] transition-colors px-2 py-2">
                  <Trash2 size={13} />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Excluir?</span>
                  <button onClick={async () => { await deleteProject(activeProject.id); setConfirmDelete(false) }}
                    className="text-xs text-[#B80E02] font-bold">Sim</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400">Não</button>
                </div>
              )}
            </div>
          )}
        </div>

        {activeProject && (
          <div className="flex gap-1 mt-3">
            {TOOLS.map((tool) => {
              const done = !!activeProject[tool.key]
              return (
                <div key={tool.id} title={tool.label}
                  className={`flex-1 h-1.5 rounded-full transition-all ${done ? 'bg-[#1B6B3A]' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )
            })}
          </div>
        )}
      </div>

      {/* Tool cards */}
      <div className="space-y-3">
        {TOOLS.map((tool, i) => {
          const Icon = tool.icon
          const status = getStatus(tool)
          return (
            <button key={tool.id} onClick={() => setActiveTool(i)}
              className="w-full text-left bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:border-[#1B6B3A] dark:hover:border-green-600 hover:shadow-md transition-all group">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tool.color}`}>
                  <Icon size={18} className={tool.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ferramenta {i + 1}</span>
                    {status === 'done'
                      ? <span className="flex items-center gap-1 text-[9px] font-bold bg-[#E8F5EE] text-[#1B6B3A] dark:bg-[#0F4A28]/30 dark:text-green-400 px-1.5 py-0.5 rounded-full uppercase">
                          <CheckCircle size={8} /> Concluída
                        </span>
                      : <span className="flex items-center gap-1 text-[9px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full uppercase">
                          <Circle size={8} /> Não iniciada
                        </span>
                    }
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-[#1B6B3A] dark:group-hover:text-green-400 transition-colors mb-1">
                    {tool.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tool.desc}</p>
                </div>
                <span className="text-gray-300 dark:text-gray-600 group-hover:text-[#1B6B3A] dark:group-hover:text-green-400 transition-colors text-lg shrink-0">→</span>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 pb-4">
        Os dados de cada ferramenta alimentam automaticamente a próxima · Resultados salvos por projeto
      </p>
    </div>
  )
}
