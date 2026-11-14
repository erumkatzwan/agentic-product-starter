package com.agentic.app.core.services

import com.agentic.app.core.network.ApiClient
import com.agentic.app.core.network.Endpoints
import kotlinx.serialization.Serializable

@Serializable
data class Item(val id: String, val title: String, val subtitle: String)

/** Data access for items. View models depend on the interface so tests can swap it. */
interface ItemsRepository {
    suspend fun fetchItems(): List<Item>
}

class RemoteItemsRepository(private val apiClient: ApiClient) : ItemsRepository {
    override suspend fun fetchItems(): List<Item> = apiClient.send(Endpoints.items)
}
