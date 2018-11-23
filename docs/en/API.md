# Redux Balloon API



## biz = balloon()

Return business instance:

```javascript
import { balloon } from 'redux-balloon';

const biz = balloon();
```



## biz.model(model)

Register business model. Model is a very important concept. A model includes six properties:

```javascript
biz.model({
    namespace: '...',
    state: {...},
    reducers: {...},
    actions: {...},
    selectors: ({...}) => {...},
    sagas: {...}
});
```

### namespace



