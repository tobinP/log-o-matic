var player_number = 0

func _enter_tree():
	print("&&& _enter_tree");
	player_number += 1
	print("&&& player_number: " + player_number);