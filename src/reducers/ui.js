export const initialState = {
  showAddressSearchModal: false
}

export default function reducer(state, action) {
  switch(action.type) {
    case 'ui/SHOW_ADDRESS_SEARCH_MODAL':
      return { ...state, showAddressSearchModal: action.show }
    default:
      return state
  }
}

export function showAddressSearchModal(show) {
  return { type: 'ui/SHOW_ADDRESS_SEARCH_MODAL', show }
}
