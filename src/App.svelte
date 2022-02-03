
<script>

	import TabList from "./components/TabList.svelte";
	import FilledButton from "./components/FilledButton.svelte";
	import ProgressCircleList from "./components/ProgressCircleList.svelte";
	import TodoList from "./components/TodoList.svelte";

	let groups = [
		{id: 0, title: "General", done: 0, color: "#3069DF", todos: [{id: 0, todo: "Kaste søppel", checked: false},{id: 1, todo: "Spasere med hunden", checked: false}]},
		{id: 1, title: "Meetings", done: 0, color: "#FC7449", todos: [{id: 0, todo: "Påmelde teams", checked: false},{id: 1, todo: "Snakke med Olaf", checked: false}]},
		{id: 2, title: "Trip 1", done: 0, color: "#63F4F7", todos: [{id: 0, todo: "Pakke sekken", checked: false},{id: 1, todo: "Sette opp teltet", checked: false}, {id: 2, todo: "Spise", checked: false}]}
	];

	let selectedGroup = groups[0];

	function changeGroupName(event) {
		let id = event.detail.id;
		let newName = event.detail.newName;

		for(let i = 0; i < groups.length; i++)
		{
			if(groups[i].id == id) {
				groups[i].title = newName;
				break;
			}
		}
	}

	function newGroup() {
		groups = [...groups, {
			id: groups.length,
			title: undefined,
			done: 0,
			color: "#3069DF",
			todos: []
		}];
		console.log(groups);
	}

	function changeGroupColor(event) {
		let id = event.detail.id;
		let new_color = event.detail.new_color;

		for(let i = 0; i < groups.length; i++)
		{
			if(groups[i].id == id) {
				groups[i].color = new_color;
				break;
			}
		}
	}

	function removeGroup(event) {
		let id = event.detail.id;
		groups = groups.filter(group => group.id != id);
	}


	function selectGroup(event) {
		let id = event.detail.id;
		for(let i = 0; i < groups.length; i++)
		{
			if(groups[i].id == id) {
				selectedGroup = groups[i];
				break;
			}
		}
	}

	
	function todoChecked(event) {
		let id = event.detail.id;
		let groupId = event.detail.groupId;
		for(let i = 0; i < groups.length; i++)
		{
			if(groups[i].id == groupId) {
				for(let x = 0; x < groups[i].todos.length; x++) {
					if(groups[i].todos[x].id == id) {
						groups[i].todos[x].checked = true;
						groups[i].done += 1;	
						groups = groups;
						for(let i = 0; i < groups.length; i++)
						{
							if(groups[i].id == groupId) {
								selectedGroup = groups[i];
								break;
							}
						}
					}
				}
			}
		}
	}

</script>


<div class="container">
	<div class="top">
		<div class="left">
			<TabList on:nameChanged={changeGroupName} on:colorChanged={changeGroupColor} on:removeGroup={removeGroup} on:selectedGroup={selectGroup} {groups}/>
			<FilledButton value={"+ CREATE NEW GROUP"} on:newGroup={newGroup}/>
		</div>
		<div class="right">
			<ProgressCircleList {groups}/>
			<TodoList on:checked={todoChecked} {selectedGroup}/>
		</div>
	</div>
	<div class="bottom"></div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;
		margin-top: 70px;
	}

	.top {
		display: flex;
		flex-direction: row;
	}

	@media (max-width: 1080px) {
		.container > .top {
			flex-direction: column-reverse;
		}
	}
</style>