-- ROLLBACK: Devolve os 16 cards para comercial/canceladas.
-- Usa IDs fixos para não afetar cards que foram cancelados
-- legitimamente em Análise antes ou depois desta migration.

UPDATE public.kanban_cards
SET area       = 'comercial',
    updated_at = now()
WHERE stage = 'canceladas'
  AND id IN (
    '98770d2a-c702-499f-938d-a9e9911494aa',
    '251c9bde-34c9-479d-b5a3-752fd3550de1',
    '77c8229d-a75d-4729-bfe2-eff83f93645e',
    'f8107c5e-d59f-43ba-b854-f5d790264cdc',
    '40d00265-589a-4285-ad8e-cf900ad5870a',
    '9766e41d-e92f-4448-8229-0f6b3da6de2a',
    '8ea243c6-67b5-4943-a9e0-66eed8d2e4c3',
    '9a1a5230-67b0-40df-8fd1-04ecde199d43',
    'c5b2ecff-ad1c-46d8-adff-b964dd0bab46',
    '277e6d88-564a-4c80-89dd-491981dff0ee',
    '8d9e9361-170b-4afe-9eaa-8e5b62fe4369',
    'ef89aa97-8309-4748-a9d4-026ba4909546',
    '9782eb19-b7c8-44fd-b0ed-9a552dd52551',
    'fdea3802-cd3f-4d3f-a8f7-8348f2b614eb',
    '4130c297-1999-4713-b09b-b2ef7e01776e',
    '22eba7bd-02b0-4dce-b8b7-66bd3195390f'
  );
