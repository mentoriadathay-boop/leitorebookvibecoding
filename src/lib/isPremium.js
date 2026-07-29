// Determina se o usuário tem acesso a conteúdo premium.
// A tabela profiles guarda plan_type ∈ { 'free', 'monthly', 'annual', 'lifetime' }
// — tudo que não é 'free' é considerado premium.
export function isPremium(profile) {
  if (!profile || !profile.plan_type) return false
  return profile.plan_type !== 'free'
}
