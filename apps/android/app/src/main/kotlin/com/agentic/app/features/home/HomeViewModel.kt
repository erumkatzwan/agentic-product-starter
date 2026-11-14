package com.agentic.app.features.home

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.agentic.app.core.network.ApiError
import com.agentic.app.core.services.Item
import com.agentic.app.core.services.ItemsRepository

class HomeViewModel(private val repository: ItemsRepository) : ViewModel() {
    sealed interface State {
        data object Idle : State

        data object Loading : State

        data class Loaded(val items: List<Item>) : State

        data class Failed(val message: String) : State
    }

    var state: State by mutableStateOf(State.Idle)
        private set

    suspend fun load() {
        state = State.Loading
        state = try {
            State.Loaded(repository.fetchItems())
        } catch (error: ApiError) {
            State.Failed("Something went wrong. Please try again.")
        }
    }
}
