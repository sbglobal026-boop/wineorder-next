import { createClient } from '@/lib/supabase/client'

export type FixedCost = {
  id: number
  name: string
  amount: number
}

type FixedCostRow = {
  id: number
  name: string
  amount: number
}

function rowToFixedCost(row: FixedCostRow): FixedCost {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
  }
}

function fixedCostToRow(cost: Omit<FixedCost, 'id'>) {
  return {
    name: cost.name,
    amount: cost.amount,
  }
}

export async function fetchFixedCosts(): Promise<FixedCost[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('fixed_costs').select('*').order('id')
  if (error) throw error
  return (data ?? []).map(rowToFixedCost)
}

export async function createFixedCostRow(cost: Omit<FixedCost, 'id'>): Promise<FixedCost> {
  const supabase = createClient()
  const { data, error } = await supabase.from('fixed_costs').insert(fixedCostToRow(cost)).select().single()
  if (error) throw error
  return rowToFixedCost(data)
}

export async function deleteFixedCostRow(id: number): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('fixed_costs').delete().eq('id', id)
  if (error) throw error
}