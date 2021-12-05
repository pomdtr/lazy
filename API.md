> WETZEL_WARNING: Unrecognized JSON Schema.

# Objects
* [`Lazy.Command`](#reference-lazy-command)
* [`Lazy.ItemTemplate`](#reference-lazy-itemtemplate)
* [`Lazy.RefAction`](#reference-lazy-refaction)
* [`Lazy.RunAction`](#reference-lazy-runaction)
* [`Lazy.StepEnv`](#reference-lazy-stepenv)








---------------------------------------
<a name="reference-lazy-cache"></a>
## Lazy.Cache

**`Lazy.Cache` Properties**

|   |Type|Description|Required|
|---|---|---|---|
|**duration**|`string`|| &#10003; Yes|
|**key**|`string`|| &#10003; Yes|

Additional properties are not allowed.

### Lazy.Cache.duration

* **Type**: `string`
* **Required**:  &#10003; Yes

### Lazy.Cache.key

* **Type**: `string`
* **Required**:  &#10003; Yes




---------------------------------------
<a name="reference-lazy-command"></a>
## Lazy.Command

**`Lazy.Command` Properties**

|   |Type|Description|Required|
|---|---|---|---|
|**command**|`string`|| &#10003; Yes|
|**errorMessage**|`string`||No|
|**shell**|`string`||No|
|**skip_lines**|`number`||No|
|**updateItems**|`boolean`||No|

Additional properties are not allowed.

### Lazy.Command.command

* **Type**: `string`
* **Required**:  &#10003; Yes

### Lazy.Command.errorMessage

* **Type**: `string`
* **Required**: No

### Lazy.Command.shell

* **Type**: `string`
* **Required**: No

### Lazy.Command.skip_lines

* **Type**: `number`
* **Required**: No

### Lazy.Command.updateItems

* **Type**: `boolean`
* **Required**: No




---------------------------------------
<a name="reference-lazy-filterlist"></a>
## Lazy.FilterList

**`Lazy.FilterList` Properties**

|   |Type|Description|Required|
|---|---|---|---|
|**cache**|`Lazy.Cache`||No|
|**generator**|`object`|| &#10003; Yes|
|**items**|`Lazy.ItemTemplate`||No|
|**params**|`Lazy.StepEnv`||No|
|**type**|`string`|| &#10003; Yes|

Additional properties are not allowed.

### Lazy.FilterList.cache

* **Type**: `Lazy.Cache`
* **Required**: No

### Lazy.FilterList.generator

* **Type**: `object`
* **Required**:  &#10003; Yes
* **Allowed values**:

### Lazy.FilterList.items

* **Type**: `Lazy.ItemTemplate`
* **Required**: No

### Lazy.FilterList.params

* **Type**: `Lazy.StepEnv`
* **Required**: No

### Lazy.FilterList.type

* **Type**: `string`
* **Required**:  &#10003; Yes
* **Allowed values**:
    * `"filter"`




---------------------------------------
<a name="reference-lazy-itemtemplate"></a>
## Lazy.ItemTemplate

**`Lazy.ItemTemplate` Properties**

|   |Type|Description|Required|
|---|---|---|---|
|**actions**|`array[]`||No|
|**delimiter**|`string`||No|
|**preview**|`object`||No|
|**subtitle**|`string`||No|
|**title**|`string`||No|

Additional properties are not allowed.

### Lazy.ItemTemplate.actions

* **Type**: `array[]`
    * Each element in the array must be one of the following values:
* **Required**: No

### Lazy.ItemTemplate.delimiter

* **Type**: `string`
* **Required**: No

### Lazy.ItemTemplate.preview

* **Type**: `object`
* **Required**: No
* **Allowed values**:

### Lazy.ItemTemplate.subtitle

* **Type**: `string`
* **Required**: No

### Lazy.ItemTemplate.title

* **Type**: `string`
* **Required**: No




---------------------------------------
<a name="reference-lazy-querylist"></a>
## Lazy.QueryList

**`Lazy.QueryList` Properties**

|   |Type|Description|Required|
|---|---|---|---|
|**generator**|`object`|| &#10003; Yes|
|**items**|`Lazy.ItemTemplate`||No|
|**params**|`Lazy.StepEnv`||No|
|**type**|`string`|| &#10003; Yes|

Additional properties are not allowed.

### Lazy.QueryList.generator

* **Type**: `object`
* **Required**:  &#10003; Yes
* **Allowed values**:

### Lazy.QueryList.items

* **Type**: `Lazy.ItemTemplate`
* **Required**: No

### Lazy.QueryList.params

* **Type**: `Lazy.StepEnv`
* **Required**: No

### Lazy.QueryList.type

* **Type**: `string`
* **Required**:  &#10003; Yes
* **Allowed values**:
    * `"query"`




---------------------------------------
<a name="reference-lazy-refaction"></a>
## Lazy.RefAction

**`Lazy.RefAction` Properties**

|   |Type|Description|Required|
|---|---|---|---|
|**condition**|`string`||No|
|**params**|`Lazy.StepEnv`||No|
|**target**|`string`|| &#10003; Yes|
|**title**|`string`|| &#10003; Yes|
|**type**|`string`|| &#10003; Yes|

Additional properties are not allowed.

### Lazy.RefAction.condition

* **Type**: `string`
* **Required**: No

### Lazy.RefAction.params

* **Type**: `Lazy.StepEnv`
* **Required**: No

### Lazy.RefAction.target

* **Type**: `string`
* **Required**:  &#10003; Yes

### Lazy.RefAction.title

* **Type**: `string`
* **Required**:  &#10003; Yes

### Lazy.RefAction.type

* **Type**: `string`
* **Required**:  &#10003; Yes
* **Allowed values**:
    * `"ref"`




---------------------------------------
<a name="reference-lazy-runaction"></a>
## Lazy.RunAction

**`Lazy.RunAction` Properties**

|   |Type|Description|Required|
|---|---|---|---|
|**command**|`string`|| &#10003; Yes|
|**condition**|`string`||No|
|**confirm**|`boolean`||No|
|**errorMessage**|`string`||No|
|**shell**|`string`||No|
|**skip_lines**|`number`||No|
|**title**|`string`|| &#10003; Yes|
|**type**|`string`|| &#10003; Yes|
|**updateItems**|`boolean`||No|

Additional properties are not allowed.

### Lazy.RunAction.command

* **Type**: `string`
* **Required**:  &#10003; Yes

### Lazy.RunAction.condition

* **Type**: `string`
* **Required**: No

### Lazy.RunAction.confirm

* **Type**: `boolean`
* **Required**: No

### Lazy.RunAction.errorMessage

* **Type**: `string`
* **Required**: No

### Lazy.RunAction.shell

* **Type**: `string`
* **Required**: No

### Lazy.RunAction.skip_lines

* **Type**: `number`
* **Required**: No

### Lazy.RunAction.title

* **Type**: `string`
* **Required**:  &#10003; Yes

### Lazy.RunAction.type

* **Type**: `string`
* **Required**:  &#10003; Yes
* **Allowed values**:
    * `"run"`

### Lazy.RunAction.updateItems

* **Type**: `boolean`
* **Required**: No




---------------------------------------
<a name="reference-lazy-stepenv"></a>
## Lazy.StepEnv

Additional properties are allowed.










---------------------------------------
<a name="reference-wetzel_warning:-title-not-defined"></a>
## WETZEL_WARNING: title not defined

** Properties**

|   |Type|Description|Required|
|---|---|---|---|
|**filepath**|`string`||No|
|**packageName**|`string`|| &#10003; Yes|
|**preferences**|`Lazy.StepEnv`||No|
|**requirements**|`string` `[]`||No|
|**roots**|`array[]`|| &#10003; Yes|
|**steps**|`object`|| &#10003; Yes|

Additional properties are not allowed.

### WETZEL_WARNING: title not defined.filepath

* **Type**: `string`
* **Required**: No

### WETZEL_WARNING: title not defined.packageName

* **Type**: `string`
* **Required**:  &#10003; Yes

### WETZEL_WARNING: title not defined.preferences

* **Type**: `Lazy.StepEnv`
* **Required**: No

### WETZEL_WARNING: title not defined.requirements

* **Type**: `string` `[]`
* **Required**: No

### WETZEL_WARNING: title not defined.roots

* **Type**: `array[]`
    * Each element in the array must be one of the following values:
* **Required**:  &#10003; Yes

### WETZEL_WARNING: title not defined.steps

* **Type**: `object`
* **Required**:  &#10003; Yes
* **Type of each property**: `object`


