// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract supplyChain {
    uint32 public product_id = 0; // Product ID
    uint32 public participant_id = 0; // Participant ID
    uint32 public owner_id = 0; // Ownership ID
    struct product {
        uint32 id;
        string modelNumber;
        string partNumber;
        string serialNumber;
        address manufacturer;
        address productOwner;
        uint32 cost;
        uint32 mfgTimeStamp;
        ProductSuppliers[] suppliers;
        uint32 consumer;
        uint32 state; // 0 - not started, 1 - in_process, 2 - done
    }

    mapping(uint32 => product) public products;
    struct participant {
        uint32 id;
        string userName;
        string password;
        string participantType;
        address participantAddress;
    }
    struct ProductSuppliers {
        uint32 id;
        uint32 cost;
    }

    mapping(uint32 => participant) public participants;
    struct ownership {
        uint32 productId;
        uint32 ownerId;
        uint32 trxTimeStamp;
        address productOwner;
    }
    mapping(uint32 => ownership) public ownerships; // ownerships by ownership ID (owner_id)
    mapping(uint32 => address[]) public productTrack; // ownerships by Product ID (product_id) / Movement track for a product
    mapping(uint32 => uint32[]) public createByManufacturer;

    event TransferOwnership(uint32 productId);
    event Participant(uint32 userId);
    event Product(uint32 productId);

    function addParticipant(
        string memory _name,
        string memory _pass,
        address _pAdd,
        string memory _pType
    ) public returns (uint32) {
        uint32 userId = participant_id++;
        participants[userId].id = userId;
        participants[userId].userName = _name;
        participants[userId].password = _pass;
        participants[userId].participantAddress = _pAdd;
        participants[userId].participantType = _pType;

        emit Participant(userId);
        return userId;
    }

    function getParticipant(
        uint32 _participant_id
    ) public view returns (string memory, address, string memory) {
        return (
            participants[_participant_id].userName,
            participants[_participant_id].participantAddress,
            participants[_participant_id].participantType
        );
    }

    function addProduct(
        uint32 _ownerId,
        string memory _modelNumber,
        string memory _partNumber,
        string memory _serialNumber,
        uint32 _productCost,
        uint32 _consumer,
        ProductSuppliers[] memory _supplierList
    ) public returns (uint32) {
        if (
            keccak256(
                abi.encodePacked(participants[_ownerId].participantType)
            ) == keccak256("Manufacturer")
        ) {
            uint32 productId = product_id++;
            products[productId].id = productId;
            products[productId].modelNumber = _modelNumber;
            products[productId].partNumber = _partNumber;
            products[productId].serialNumber = _serialNumber;
            products[productId].cost = _productCost;
            products[productId].manufacturer = participants[_ownerId]
                .participantAddress;
            products[productId].productOwner = participants[_ownerId]
                .participantAddress;
            products[productId].mfgTimeStamp = uint32(block.timestamp);
            for (uint256 i = 0; i < _supplierList.length; i++) {
                products[productId].suppliers.push(_supplierList[i]);
            }
            products[productId].consumer = _consumer;
            products[productId].state = 0;

            createByManufacturer[_ownerId].push(productId);
            productTrack[productId].push(
                participants[_ownerId].participantAddress
            );

            emit Product(productId);
            return productId;
        }
        return 0;
    }

    modifier onlyOwner(uint32 _productId) {
        // require(msg.sender == products[_productId].productOwner, "");
        _;
    }

    function getProductsForManufacturer(
        uint32 _manufacturer_id
    ) public view returns (uint32[] memory) {
        return (createByManufacturer[_manufacturer_id]);
    }

    function getProduct(
        uint32 _productId
    ) public view returns (product memory) {
        return (products[_productId]);
    }

    function getProductsBySupplier(
        uint32 _supplierId
    ) public view returns (product[] memory) {
        uint32 count = 0;
        for (uint32 i = 0; i <= product_id; i++) {
            if (
                products[i].productOwner ==
                participants[_supplierId].participantAddress
            ) {
                count++;
            }
        }

        product[] memory productsOwned = new product[](count);
        count = 0;

        for (uint32 i = 0; i <= product_id; i++) {
            if (
                products[i].productOwner ==
                participants[_supplierId].participantAddress
            ) {
                productsOwned[count] = products[i];
                count++;
            }
        }

        return productsOwned;
    }

    function moveProductToNextStage(
        uint32 _prodId
    ) public onlyOwner(_prodId) returns (bool) {
        address nextOwner;
        uint32 nextId;
        uint32 newState;

        if (products[_prodId].productOwner == products[_prodId].manufacturer) {
            if (products[_prodId].suppliers.length == 0) {
                nextId = products[_prodId].consumer;
                nextOwner = participants[nextId].participantAddress;
                newState = 2;
            } else {
                nextId = products[_prodId].suppliers[0].id;
                nextOwner = participants[nextId].participantAddress;
                newState = 1;
            }
        } else {
            uint32 currentOwnerIndex = 0;

            for (uint32 i = 0; i < products[_prodId].suppliers.length; i++) {
                if (
                    participants[products[_prodId].suppliers[i].id]
                        .participantAddress == products[_prodId].productOwner
                ) {
                    currentOwnerIndex = i;
                    break;
                }
            }
            if (currentOwnerIndex == products[_prodId].suppliers.length - 1) {
                nextId = products[_prodId].consumer;
                nextOwner = participants[nextId].participantAddress;
                newState = 2;
            } else {
                uint32 nextSupplierIndex = currentOwnerIndex + 1;

                nextId = products[_prodId].suppliers[nextSupplierIndex].id;
                nextOwner = participants[nextId].participantAddress;
                newState = 1;
            }
        }

        uint32 ownership_id = owner_id++;
        ownerships[ownership_id].productId = _prodId;
        ownerships[ownership_id].productOwner = nextOwner;
        ownerships[ownership_id].ownerId = nextId;
        ownerships[ownership_id].trxTimeStamp = uint32(block.timestamp);
        productTrack[_prodId].push(nextOwner);

        products[_prodId].productOwner = nextOwner;
        products[_prodId].state = newState;

        emit TransferOwnership(_prodId);

        return true;
    }

    // function newOwner(
    //     uint32 _user1Id,
    //     uint32 _user2Id,
    //     uint32 _prodId
    // ) public onlyOwner(_prodId) returns (bool) {
    //     participant memory p1 = participants[_user1Id];
    //     participant memory p2 = participants[_user2Id];
    //     uint32 ownership_id = owner_id++;

    //     if (
    //         keccak256(abi.encodePacked(p1.participantType)) ==
    //         keccak256("Manufacturer") &&
    //         keccak256(abi.encodePacked(p2.participantType)) ==
    //         keccak256("Supplier")
    //     ) {
    //         ownerships[ownership_id].productId = _prodId;
    //         ownerships[ownership_id].productOwner = p2.participantAddress;
    //         ownerships[ownership_id].ownerId = _user2Id;
    //         ownerships[ownership_id].trxTimeStamp = uint32(block.timestamp);
    //         products[_prodId].productOwner = p2.participantAddress;
    //         productTrack[_prodId].push(ownership_id);
    //         emit TransferOwnership(_prodId);
    //         return (true);
    //     } else if (
    //         keccak256(abi.encodePacked(p1.participantType)) ==
    //         keccak256("Supplier") &&
    //         keccak256(abi.encodePacked(p2.participantType)) ==
    //         keccak256("Supplier")
    //     ) {
    //         ownerships[ownership_id].productId = _prodId;
    //         ownerships[ownership_id].productOwner = p2.participantAddress;
    //         ownerships[ownership_id].ownerId = _user2Id;
    //         ownerships[ownership_id].trxTimeStamp = uint32(block.timestamp);
    //         products[_prodId].productOwner = p2.participantAddress;
    //         productTrack[_prodId].push(ownership_id);
    //         emit TransferOwnership(_prodId);
    //         return (true);
    //     } else if (
    //         keccak256(abi.encodePacked(p1.participantType)) ==
    //         keccak256("Supplier") &&
    //         keccak256(abi.encodePacked(p2.participantType)) ==
    //         keccak256("Consumer")
    //     ) {
    //         ownerships[ownership_id].productId = _prodId;
    //         ownerships[ownership_id].productOwner = p2.participantAddress;
    //         ownerships[ownership_id].ownerId = _user2Id;
    //         ownerships[ownership_id].trxTimeStamp = uint32(block.timestamp);
    //         products[_prodId].productOwner = p2.participantAddress;
    //         productTrack[_prodId].push(ownership_id);
    //         emit TransferOwnership(_prodId);
    //         return (true);
    //     }
    //     return (false);
    // }

    function getProvenance(
        uint32 _prodId
    ) external view returns (address[] memory) {
        return productTrack[_prodId];
    }

    function getOwnership(
        uint32 _regId
    ) public view returns (uint32, uint32, address, uint32) {
        ownership memory r = ownerships[_regId];
        return (r.productId, r.ownerId, r.productOwner, r.trxTimeStamp);
    }

    function authenticateParticipant(
        uint32 _uid,
        string memory _uname,
        string memory _pass,
        string memory _utype
    ) public view returns (bool) {
        if (
            keccak256(abi.encodePacked(participants[_uid].participantType)) ==
            keccak256(abi.encodePacked(_utype))
        ) {
            if (
                keccak256(abi.encodePacked(participants[_uid].userName)) ==
                keccak256(abi.encodePacked(_uname))
            ) {
                if (
                    keccak256(abi.encodePacked(participants[_uid].password)) ==
                    keccak256(abi.encodePacked(_pass))
                ) {
                    return (true);
                }
            }
        }
        return (false);
    }
}
