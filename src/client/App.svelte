<script>
export let client;
export let signer;
export let address;
export let addressAsBytes;
export let identity;
export let config;

// let user = {};
// let isSignedIn = false;

async function getUser() {
    return (await fetch("/auth/user")).json();
}

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
    <p>
    Orbs Identity service helps smart contract developers to keep track of users that use 
    multiple keys or are at risk of losing their keys. It verifies user email address via Google sign in, and then issues 
    a unique ID tied to a certain Orbs address.
    </p>

    <p>If the key is lost, the user can replace an old key by repeating the process. From the perspective of the 
    smart contract developer nothing has changed because she always operated with IDs and not Orbs addresses.</p>

    <hr>

    {#await getUser()}
    <!-- -->
    {:then user}
    <p>
    {#if typeof user.identity === "string"}
    You are signed in as {user.name} ({user.email}).
    {:else}
    You are not <a href="/auth/google">signed in with Google</a>.
    {/if}
    </p>
    {/await}

    <p>Your Orbs address is <span class="id">{address}</span></p>
    
    <p>
    {#await identity.getIdByAddress(addressAsBytes)}
    Looking up your identity in the smart contract...
    {:then id}
    {#if id === ""}
        You do not yet have an identity associated with your address. 
        {#await getUser()}
        <!-- -->
        {:then user}
        {#if typeof user.identity === "string"}
        Would you like to <a href="#">create one</a>?
        {:else}
        To create one, you first need to <a href="/auth/google">sign in with Google</a>.            
        {/if}
        {/await}
    {:else}
        Your Orbs identity in <a href="{config.PrimsUrl}">the smart contract</a> is <span class="id">{id}</span>
    {/if}
    {:catch e}
    <span class="error">Could not communicate with the smart contract: {e}</span>
    {/await}
    </p>
    </div>
</div>
