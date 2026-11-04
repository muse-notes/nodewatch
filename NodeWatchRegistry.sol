// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title NodeWatchRegistry
/// @notice Minimal registry of Portaldot nodes that users want to watch.
/// @dev Demo-scale contract for the Portaldot Hacker House 2026 (Track 3:
///      Node Operations & Tooling). Reads are free and need no wallet.
///      `listNodes` returns every entry with its `active` flag; a production
///      version would paginate instead of returning the whole array.
contract NodeWatchRegistry {
    struct WatchedNode {
        address owner;
        string name;
        string endpoint;
        uint256 addedAt;
        bool active;
    }

    WatchedNode[] private nodes;
    mapping(address => uint256[]) private nodesByOwner;

    event NodeRegistered(
        uint256 indexed id,
        address indexed owner,
        string name,
        string endpoint
    );
    event NodeRemoved(uint256 indexed id, address indexed owner);

    /// @notice Register a node to watch. Returns the new node id.
    function registerNode(
        string calldata name,
        string calldata endpoint
    ) external returns (uint256 id) {
        require(bytes(name).length > 0, "name required");
        require(bytes(endpoint).length > 0, "endpoint required");
        id = nodes.length;
        nodes.push(
            WatchedNode({
                owner: msg.sender,
                name: name,
                endpoint: endpoint,
                addedAt: block.timestamp,
                active: true
            })
        );
        nodesByOwner[msg.sender].push(id);
        emit NodeRegistered(id, msg.sender, name, endpoint);
    }

    /// @notice Deactivate one of your own nodes. Only the owner can remove it.
    function removeNode(uint256 id) external {
        require(id < nodes.length, "unknown node");
        WatchedNode storage node = nodes[id];
        require(node.owner == msg.sender, "not the owner");
        require(node.active, "already removed");
        node.active = false;
        emit NodeRemoved(id, msg.sender);
    }

    /// @notice Total number of registered nodes (active + removed).
    function nodeCount() external view returns (uint256) {
        return nodes.length;
    }

    /// @notice One node by id.
    function getNode(uint256 id) external view returns (WatchedNode memory) {
        require(id < nodes.length, "unknown node");
        return nodes[id];
    }

    /// @notice All nodes, in registration order, with their active flags.
    function listNodes() external view returns (WatchedNode[] memory) {
        return nodes;
    }

    /// @notice Ids of nodes registered by one owner.
    function listNodesByOwner(
        address owner
    ) external view returns (uint256[] memory) {
        return nodesByOwner[owner];
    }
}
