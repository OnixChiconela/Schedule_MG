import { USER_INTEREST_CATEGORIES } from "@/app/lib/categories"
import api from "../../api"

export const fetchEventSuggestions = async (
  location: { latitude: number, longitude: number },
  selectedLabels: string[] // ['Technology', 'Music']
) => {
  try {
    const selectedCategories = USER_INTEREST_CATEGORIES.filter(cat =>
      selectedLabels.includes(cat.label)
    )

    const eventbriteIds = selectedCategories.map(cat => cat.eventbriteId)
    const meetupIds = selectedCategories.map(cat => cat.meetupId)

    // console.log(eventbriteIds, " and ", meetupIds)

    const res = await api.post('/suggested-events/suggestions', {
      location,
    //   eventbriteIds,
      meetupIds,
    })

    return res.data
  } catch (error) {
    console.error('Error fetching event: ', error)
  }
}
