# useDrupal

useDrupal is a ReactJS module designed to expedite the development time for a headless Drupal experience. It leverages Drupal's Commerce API and JSON:API to handle common functionality and provides useHooks for users, nodes, and commerce API, specifically catering to cart and checkout processes.

**Please note that as this module is currently in development, it may not be stable or feature-complete. It is recommended to thoroughly test the module and be prepared for potential issues or changes as development progresses.**

## Installation

To install useDrupal, you can use npm or yarn:

```bash
npm install use-drupal
```

or

```bash
yarn add use-drupal
```

## Usage

To use the useDrupal module, you need to import it in your ReactJS project:

```jsx
import useDrupal from 'use-drupal';
```

The module provides several hooks that you can use to interact with Drupal's user, node, and Commerce API. These hooks provide an easy and efficient way to handle common functionality in your headless Drupal project.

## Context provider
Wrap your application components with the DrupalProvider component and provide the required props (client and config):

Import the necessary dependencies in your project file where you want to use the DrupalProvider component:
```jsx
import DrupalProvider from 'use-drupal';
```
Wrap your application components with the DrupalProvider component and provide the required props (client and config):
```jsx
function App() {
  // Your client and config setup
  const client = // Your client setup
  const config = // Your config setup

  return (
    <DrupalProvider client={client} config={config}>
      {/* Your application components */}
    </DrupalProvider>
  );
}
```

Note: Make sure to replace client and config with your actual client and configuration values.

Access the Drupal state and setDrupalState function in your application components using the DrupalStateContext:

```jsx
import { useContext } from 'react';
import { useDrupal } from 'use-drupal';

function MyComponent() {
  const { drupalState, setDrupalState } = useDrupal();

  // Access the Drupal state values
  console.log(drupalState.user);
  console.log(drupalState.cart);

  // Your component JSX
  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```
The useContext hook is used to access the Drupal state and setDrupalState function provided by the DrupalStateContext. You can access the Drupal state values (user, cart, customerProfiles) and update the state as needed.

That's it! You have successfully integrated the DrupalProvider component into your project, and you can now access and update the Drupal state in your application components.

## Hooks

### useDrupalUser
The useDrupalUser hook is a custom hook that provides functions and state related to the Drupal user in your ReactJS project. It interacts with the Drupal API and handles user-related operations such as fetching the current user, logging in, logging out, creating users, updating user data, resetting passwords, and deleting users.

### useDrupalCarts
The useDrupalCarts hook is a custom hook that provides functions and state related to the Drupal carts in your ReactJS project. It interacts with the Drupal API to handle cart-related operations such as fetching the cart data, adding items to the cart, modifying item quantities, and deleting items from the cart.

### useDrupalCheckout
The useDrupalCheckout hook is a custom hook that provides functions and state related to the checkout process in your ReactJS project. It interacts with the Drupal API to handle checkout-related operations such as getting the checkout state, updating the checkout state, and completing the checkout process.

### useDrupalJsonApi
The useDrupalJsonApi hook is a custom hook that provides functions to interact with the Drupal JSON:API in your ReactJS project. It uses the useDrupal hook to access the Drupal client and allows you to make HTTP requests to the JSON:API endpoints.

### useDrupalRestApi
The useDrupalRestApi hook is a custom hook that provides functions to interact with the Drupal REST API in your ReactJS project. It uses the useDrupal hook to access the Drupal client and allows you to make HTTP requests to the REST API endpoints.


## Service

### DrupalEntity

# DrupalEntity Class

The DrupalEntity class is a utility class designed to facilitate working with Drupal entities in your ReactJS project. It can be used in conjunction with the useDrupalJsonApi hook to build and extract information from Drupal entities with ease.

## Usage

1. Import the `DrupalEntity` class:

```jsx
import DrupalEntity from "./DrupalEntity";
```

Create a DrupalEntity instance
```jsx
const entity = new DrupalEntity(id, type, data);

entity.getValue("title") // Returns title;
```


Contributing
Contributions are welcome! If you find any issues or would like to contribute to the development of useDrupal, please open an issue or submit a pull request on the GitHub repository.

License
This project is licensed under the MIT License.