<script>
export let client;
export let signer;
export let address;
export let identity;
export let config;

export let addressToBytes;
export let encodeHex;

let user = {};
let isSignedIn = false;
let userIdentity = "";
let error;

function stringToBytes(val) {
    return new TextEncoder().encode(val);
}

async function getUser() {
    return (await fetch("/auth/user")).json();
}

async function reload() {
    try {
        user = await getUser();
        isSignedIn = typeof user.identity === "string";
        userIdentity = await identity.getIdByAddress(addressToBytes(address));
    } catch (e) {
        error = e.message;
    }
}

async function createIdentity() {
    try {
        const signature = await signer.signEd25519(stringToBytes(user.identity));
        const publicKey = await signer.getPublicKey();
        const request = await fetch("/identity/create", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                address,
                signature: encodeHex(signature),
                publicKey: encodeHex(publicKey),
            }),
        });
        const { status } = await request.json();

        reload();

        if (request.status !== 200) {
            error = status;
        } else {
            error = undefined;
        }
    } catch (e) {
        error = e.message;
    }
}

reload();

</script>

<style>
    .id {
        font-family: 'Courier New', Courier, monospace;
    }

    .error {
        color: #d32f2f;
    }

    hr {
        border: 1px solid white;
    }
</style>

<div class="centeredDiv">
    <div class="header">
        <img alt="Orbs" src="0RBS-white-version.png"/>
        <h1>
            Orbs Identity
        </h1>
    </div>
    <div>

    {#if error !== undefined}
    <p class="error">Could not communicate with the smart contract: {error}</p>
    {/if}


    <p>
    Orbs Identity service helps smart contract developers to keep track of users that use 
    multiple keys or are at risk of losing their keys. It verifies user email address via Google sign in, and then issues 
    a unique ID tied to a certain Orbs address.
    </p>

    <p>If the key is lost, the user can replace an old key by repeating the process. From the perspective of the 
    smart contract developer nothing has changed because she always operated with IDs and not Orbs addresses.</p>

    <hr>

    {#if isSignedIn}
    <p>You are signed in as {user.name} ({user.email}).</p>
    {/if}

    <p>Your Orbs address is <span class="id">{address}</span></p>
    
    <p>
    {#if userIdentity === ""}
        You do not yet have an identity associated with your address. 
        {#if isSignedIn}
        Would you like to <a href="#" on:click|preventDefault={createIdentity}>create one</a>?
        {:else}
        To create one, you first need to <a href="/auth/google">sign in with Google</a>.            
        {/if}
    {:else}
        Your Orbs identity in <a href="{config.PrimsUrl}">the smart contract</a> is <span class="id">{userIdentity}</span>
    {/if}
    </p>
    </div>
</div>
