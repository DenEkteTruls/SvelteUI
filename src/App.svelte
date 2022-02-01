
<script>

	import TabList from "./components/TabList.svelte";
	import FilledButton from "./components/FilledButton.svelte";
	import ProgressCircleList from "./components/ProgressCircleList.svelte";

	let groups = [
		{id: 0, title: "General", tasks: 16, done: 3, color: "#3069DF"},
		{id: 1, title: "Meetings", tasks: 8, done: 7, color: "#FC7449"},
		{id: 2, title: "Trip 1", tasks: 8, done: 3, color: "#63F4F7"},
		{id: 3, title: "Trip 2", tasks: 8, done: 3, color: "#FFEB00"}
	];

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
			tasks: 0,
			done: 0,
			color: "#3069DF"
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

</script>


<div class="container">
	<div class="top">
		<div class="left">
			<TabList on:nameChanged={changeGroupName} on:colorChanged={changeGroupColor} on:removeGroup={removeGroup} {groups}/>
			<FilledButton value={"+ CREATE NEW GROUP"} on:newGroup={newGroup}/>
		</div>
		<div class="right">
			<ProgressCircleList {groups}/>
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