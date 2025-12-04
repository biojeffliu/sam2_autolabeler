from collections import defaultdict

class MaskStore:
    def __init__(self):
        # MASK_STORE[folder][frame_idx][obj_id] = mask
        self.store = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: None)))
        self.objs = defaultdict(dict)

    def save_mask(self, folder, frame_idx, obj_id, mask):
        self.store[folder][frame_idx][obj_id] = mask

    def get_masks(self, folder, frame_idx):
        return self.store[folder][frame_idx]

    def delete_masks(self, folder, frame_idx):
        if frame_idx in self.store[folder]:
            del self.store[folder][frame_idx]
            return True
        return False

    def delete_masks_folder(self, folder):
        if folder in self.store:
            del self.store[folder]
        if folder in self.objs:
            self.objs.pop(folder, None)

    def clear_frame(self, folder, frame_idx):
        self.store[folder][frame_idx].clear()

    def create_obj_id(self, folder, obj_id, class_id):
        self.objs[folder][obj_id] = {
            "class_id": class_id
        }

    def delete_obj_id(self, folder, obj_id):
        self.objs[folder].pop(obj_id, None)

    def get_obj_metadata(self, folder, obj_id):
        return self.objs[folder].get(obj_id)

    def get_global_object_ids(self, folder):
        ids_from_masks = set()
        for _, objs in self.store[folder].items():
            ids_from_masks.update(objs.keys())

        ids_from_registry = set(self.objects[folder].keys())

        return sorted(ids_from_masks.union(ids_from_registry))
    
MASK_STORE = MaskStore()